const express = require('express');
const router = express.Router();
const { Task, UserTaskAttempt, User } = require('../modules');

// Получение всех заданий
router.get('/', async (req, res) => {
  try {
    const { difficulty, subject, limit = 10 } = req.query;
    
    const where = { is_active: true };
    if (difficulty) where.difficulty = difficulty;
    if (subject) where.subject = subject;
    
    const tasks = await Task.findAll({
      where,
      limit: parseInt(limit),
      order: [['created_at', 'DESC']],
      attributes: { exclude: ['correct_answer'] } // Не показываем правильный ответ
    });
    
    res.json(tasks);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Получение конкретного задания
router.get('/:id', async (req, res) => {
  try {
    const task = await Task.findByPk(req.params.id, {
      attributes: { exclude: ['correct_answer'] }
    });
    
    if (!task) {
      return res.status(404).json({ error: 'Задание не найдено' });
    }
    
    res.json(task);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Отправка ответа на задание
router.post('/:id/attempt', async (req, res) => {
  try {
    const { user_id, selected_answer } = req.body;
    const task_id = req.params.id;
    
    // Получаем задание с правильным ответом
    const task = await Task.findByPk(task_id);
    if (!task) {
      return res.status(404).json({ error: 'Задание не найдено' });
    }
    
    // Проверяем правильность ответа
    const is_correct = selected_answer.toLowerCase().trim() === task.correct_answer.toLowerCase().trim();
    
    // Сохраняем попытку
    const attempt = await UserTaskAttempt.create({
      user_id,
      task_id,
      selected_answer,
      is_correct
    });
    
    // Если ответ правильный, добавляем опыт и монеты
    if (is_correct) {
      const user = await User.findByPk(user_id);
      if (user) {
        const expGain = task.difficulty * 50; // 50, 100, 150 очков за сложность
        const coinGain = task.difficulty * 10; // 10, 20, 30 монет
        
        user.experience_points += expGain;
        user.coins += coinGain;
        await user.save();
        
        res.json({
          correct: true,
          message: 'Правильно!',
          rewards: { exp: expGain, coins: coinGain },
          attempt_id: attempt.attempt_id
        });
      }
    } else {
      res.json({
        correct: false,
        message: 'Неправильно. Попробуйте еще раз!',
        correct_answer: task.correct_answer,
        attempt_id: attempt.attempt_id
      });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Получение статистики по заданиям для пользователя
router.get('/user/:user_id/stats', async (req, res) => {
  try {
    const user_id = req.params.user_id;
    
    const stats = await UserTaskAttempt.findAll({
      where: { user_id },
      include: [{ model: Task, attributes: ['task_id', 'difficulty', 'subject'] }],
      order: [['attempt_time', 'DESC']]
    });
    
    const summary = {
      total_attempts: stats.length,
      correct_attempts: stats.filter(s => s.is_correct).length,
      by_difficulty: {
        1: { total: 0, correct: 0 },
        2: { total: 0, correct: 0 },
        3: { total: 0, correct: 0 }
      }
    };
    
    stats.forEach(stat => {
      if (stat.Task) {
        const diff = stat.Task.difficulty;
        summary.by_difficulty[diff].total++;
        if (stat.is_correct) summary.by_difficulty[diff].correct++;
      }
    });
    
    res.json({
      user_id,
      summary,
      recent_attempts: stats.slice(0, 10)
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
