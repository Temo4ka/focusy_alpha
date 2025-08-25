const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const { User } = require('../modules');
const bcrypt = require('bcryptjs');

// Регистрация пользователя (для Telegram бота)
router.post('/register', async (req, res) => {
  try {
    const { user_id, name, user_class = "4", consent_given = true } = req.body;
    
    // Проверяем, не существует ли уже пользователь
    const existingUser = await User.findOne({ where: { user_id } });
    if (existingUser) {
      return res.status(400).json({ error: 'Пользователь уже зарегистрирован' });
    }
    
    const user = await User.create({
      user_id,
      name,
      user_class,
      consent_given,
      experience_points: 0,
      coins: 0,
      subscribe: false
    });

    res.status(201).json({
      message: 'Пользователь успешно зарегистрирован',
      user: {
        user_id: user.user_id,
        name: user.name,
        user_class: user.user_class,
        experience_points: user.experience_points,
        coins: user.coins,
        subscribe: user.subscribe
      }
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Авторизация по Telegram ID
router.post('/login', async (req, res) => {
  try {
    const { user_id } = req.body;
    const user = await User.findOne({ where: { user_id } });
    
    if (!user) {
      return res.status(404).json({ error: 'Пользователь не найден' });
    }

    // Создаем токен
    const token = jwt.sign(
      { userId: user.user_id },
      process.env.JWT_SECRET || 'default_secret',
      { expiresIn: '24h' }
    );

    res.json({ 
      message: 'Авторизация успешна',
      token, 
      user: { 
        user_id: user.user_id,
        name: user.name, 
        user_class: user.user_class, 
        experience_points: user.experience_points, 
        coins: user.coins,
        subscribe: user.subscribe
      } 
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Получение данных пользователя
router.get('/:user_id', async (req, res) => {
  try {
    const user = await User.findOne({ 
      where: { user_id: req.params.user_id }
    });
    
    if (!user) {
      return res.status(404).json({ error: 'Пользователь не найден' });
    }

    res.json({
      user_id: user.user_id,
      name: user.name,
      user_class: user.user_class,
      consent_given: user.consent_given,
      experience_points: user.experience_points,
      coins: user.coins,
      subscribe: user.subscribe,
      level: Math.floor(user.experience_points / 1000) + 1,
      created_at: user.created_at
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

module.exports = router;