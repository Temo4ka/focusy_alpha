const express = require('express');
const router = express.Router();
const { Mission, UserMission, User, UserTaskAttempt } = require('../modules');

// Получение всех активных миссий
router.get('/', async (req, res) => {
  try {
    const missions = await Mission.findAll({
      where: { is_active: true },
      order: [['difficulty_level', 'ASC'], ['created_at', 'DESC']]
    });
    
    res.json(missions);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Получение миссий для конкретного пользователя
router.get('/user/:user_id', async (req, res) => {
  try {
    const user_id = req.params.user_id;
    
    // Получаем все активные миссии с информацией о прогрессе пользователя
    const missions = await Mission.findAll({
      where: { is_active: true },
      include: [{
        model: UserMission,
        where: { user_id },
        required: false
      }],
      order: [['difficulty_level', 'ASC']]
    });
    
    // Добавляем информацию о прогрессе
    const missionsWithProgress = await Promise.all(missions.map(async (mission) => {
      const userMission = mission.UserMissions?.[0];
      
      // Подсчитываем прогресс (количество правильно выполненных заданий)
      const correctAttempts = await UserTaskAttempt.count({
        where: { 
          user_id,
          is_correct: true
        }
      });
      
      const progress = Math.min(correctAttempts, mission.required_tasks);
      const isCompleted = userMission?.is_completed || false;
      const canComplete = progress >= mission.required_tasks && !isCompleted;
      
      return {
        ...mission.toJSON(),
        user_progress: {
          current: progress,
          required: mission.required_tasks,
          percentage: Math.round((progress / mission.required_tasks) * 100),
          is_completed: isCompleted,
          can_complete: canComplete,
          completed_at: userMission?.completed_at || null
        }
      };
    }));
    
    res.json(missionsWithProgress);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Начать миссию
router.post('/:mission_id/start', async (req, res) => {
  try {
    const { mission_id } = req.params;
    const { user_id } = req.body;
    
    const mission = await Mission.findByPk(mission_id);
    if (!mission || !mission.is_active) {
      return res.status(404).json({ error: 'Миссия не найдена или неактивна' });
    }
    
    // Проверяем, не начата ли уже миссия
    const existingUserMission = await UserMission.findOne({
      where: { user_id, mission_id }
    });
    
    if (existingUserMission) {
      return res.status(400).json({ error: 'Миссия уже начата' });
    }
    
    // Создаем связь пользователь-миссия
    const userMission = await UserMission.create({
      user_id,
      mission_id,
      is_completed: false
    });
    
    res.json({
      message: 'Миссия начата!',
      mission: mission.title,
      user_mission_id: userMission.id
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Завершить миссию
router.post('/:mission_id/complete', async (req, res) => {
  try {
    const { mission_id } = req.params;
    const { user_id } = req.body;
    
    const mission = await Mission.findByPk(mission_id);
    if (!mission) {
      return res.status(404).json({ error: 'Миссия не найдена' });
    }
    
    // Проверяем прогресс пользователя
    const correctAttempts = await UserTaskAttempt.count({
      where: { 
        user_id,
        is_correct: true
      }
    });
    
    if (correctAttempts < mission.required_tasks) {
      return res.status(400).json({ 
        error: 'Недостаточно выполненных заданий',
        required: mission.required_tasks,
        current: correctAttempts
      });
    }
    
    // Находим или создаем связь пользователь-миссия
    let userMission = await UserMission.findOne({
      where: { user_id, mission_id }
    });
    
    if (!userMission) {
      userMission = await UserMission.create({
        user_id,
        mission_id,
        is_completed: false
      });
    }
    
    if (userMission.is_completed) {
      return res.status(400).json({ error: 'Миссия уже завершена' });
    }
    
    // Завершаем миссию
    userMission.is_completed = true;
    userMission.completed_at = new Date();
    await userMission.save();
    
    // Выдаем награды
    const user = await User.findByPk(user_id);
    if (user) {
      user.experience_points += mission.reward_exp;
      user.coins += mission.reward_coins;
      await user.save();
    }
    
    res.json({
      message: 'Миссия завершена!',
      mission: mission.title,
      rewards: {
        exp: mission.reward_exp,
        coins: mission.reward_coins
      },
      completed_at: userMission.completed_at
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Получение статистики по миссиям
router.get('/stats', async (req, res) => {
  try {
    const stats = await Mission.findAll({
      include: [{
        model: UserMission,
        attributes: ['is_completed'],
        required: false
      }]
    });
    
    const missionStats = stats.map(mission => {
      const userMissions = mission.UserMissions || [];
      const totalStarted = userMissions.length;
      const totalCompleted = userMissions.filter(um => um.is_completed).length;
      
      return {
        mission_id: mission.mission_id,
        title: mission.title,
        difficulty_level: mission.difficulty_level,
        total_started: totalStarted,
        total_completed: totalCompleted,
        completion_rate: totalStarted > 0 ? Math.round((totalCompleted / totalStarted) * 100) : 0
      };
    });
    
    res.json(missionStats);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
