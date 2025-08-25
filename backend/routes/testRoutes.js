const express = require('express');
const router = express.Router();

// Тестовый маршрут для проверки связи
router.get('/ping', (req, res) => {
  res.json({ 
    message: 'FOCUSY Backend API is working!',
    timestamp: new Date().toISOString(),
    endpoints: {
      users: '/api/users',
      tasks: '/api/tasks', 
      missions: '/api/missions',
      test: '/api/test'
    }
  });
});

// Тестовые данные пользователей
router.get('/demo-users', (req, res) => {
  const demoUsers = [
    {
      user_id: 1001,
      name: 'Анна Петрова',
      user_class: '5',
      experience_points: 1500,
      coins: 75,
      subscribe: false,
      level: 2
    },
    {
      user_id: 1002,
      name: 'Максим Волков',
      user_class: '6',
      experience_points: 2300,
      coins: 115,
      subscribe: true,
      level: 3
    },
    {
      user_id: 1003,
      name: 'София Смирнова',
      user_class: '4',
      experience_points: 800,
      coins: 40,
      subscribe: false,
      level: 1
    }
  ];
  
  res.json({
    message: 'Демо пользователи для тестирования',
    users: demoUsers,
    count: demoUsers.length
  });
});

// Тестовые задания
router.get('/demo-tasks', (req, res) => {
  const demoTasks = [
    {
      task_id: 1,
      type: 'Задание_4',
      difficulty: 'easy',
      subject: 'Русский язык',
      content: 'Выберите правильный вариант написания слова:\n1) Сабака\n2) Собака\n3) Собакa\n4) Сабокa',
      is_active: true
    },
    {
      task_id: 2,
      type: 'ЕГЭ_1',
      difficulty: 'hard',
      subject: 'Русский язык',
      content: 'Укажите варианты ответов, в которых верно передана ГЛАВНАЯ информация...',
      is_active: true
    },
    {
      task_id: 3,
      type: 'Задание_7',
      difficulty: 'medium',
      subject: 'Математика',
      content: 'Решите уравнение: 2x + 5 = 13',
      is_active: true
    }
  ];
  
  res.json({
    message: 'Демо задания для тестирования',
    tasks: demoTasks,
    count: demoTasks.length
  });
});

// Симуляция отправки ответа
router.post('/demo-answer', (req, res) => {
  const { task_id, user_id, answer } = req.body;
  
  // Простая логика проверки
  const correctAnswers = {
    1: '2',
    2: '2, 4',
    3: 'x = 4'
  };
  
  const isCorrect = correctAnswers[task_id] === answer;
  
  res.json({
    task_id,
    user_id,
    answer,
    is_correct: isCorrect,
    message: isCorrect ? 'Правильно! 🎉' : 'Неправильно, попробуйте еще раз',
    rewards: isCorrect ? { exp: 50, coins: 10 } : null
  });
});

module.exports = router;
