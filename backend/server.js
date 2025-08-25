const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors({
  origin: ['http://localhost:3000', 'http://127.0.0.1:3000'],
  credentials: true
}));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Импорт моделей и инициализация БД
const { sequelize } = require('./modules');

// Импорт маршрутов
const userRoutes = require('./routes/userRoutes');
const taskRoutes = require('./routes/taskRoutes');
const missionRoutes = require('./routes/missionRoutes');
const testRoutes = require('./routes/testRoutes');

// Маршруты API
app.use('/api/users', userRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/missions', missionRoutes);
app.use('/api/test', testRoutes);

// Базовый маршрут
app.get('/', (req, res) => {
  res.json({ 
    message: 'FOCUSY API Server', 
    version: '1.0.0',
    endpoints: {
      users: '/api/users',
      tasks: '/api/tasks', 
      missions: '/api/missions'
    }
  });
});

// Обработка ошибок
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Что-то пошло не так!' });
});

// Запуск сервера
async function startServer() {
  try {
    // Проверка подключения к БД
    await sequelize.authenticate();
    console.log('✅ Подключение к базе данных установлено');
    
    // Синхронизация моделей (без изменения уже существующей схемы)
    await sequelize.sync();
    console.log('✅ Модели синхронизированы');
    
    // Запуск сервера
    app.listen(PORT, () => {
      console.log(`🚀 FOCUSY API сервер запущен на http://localhost:${PORT}`);
      console.log(`📊 Админ панель: http://localhost:8001/admin/`);
      console.log(`🌐 Фронтенд: http://localhost:3000`);
    });
  } catch (error) {
    console.error('❌ Ошибка запуска сервера:', error);
    process.exit(1);
  }
}

startServer();