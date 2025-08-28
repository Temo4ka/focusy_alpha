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

// Логирование всех запросов
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
  next();
});

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

// Базовый маршрут API
app.get('/api', (req, res) => {
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
    console.log('🔄 Подключение к базе данных...');
    
    // Проверка подключения к БД с таймаутом
    const dbPromise = sequelize.authenticate();
    const timeoutPromise = new Promise((_, reject) => 
      setTimeout(() => reject(new Error('Таймаут подключения к БД')), 10000)
    );
    
    await Promise.race([dbPromise, timeoutPromise]);
    console.log('✅ Подключение к базе данных установлено');
    
    console.log('🔄 Синхронизация моделей...');
    // Отключаем автоматическую синхронизацию для предотвращения зависания
    // Модели уже существуют в базе данных
    console.log('✅ Модели уже синхронизированы (пропускаем sync)');
    
    // Запуск сервера
    app.listen(PORT, '0.0.0.0', () => {
      console.log(`🚀 FOCUSY API сервер запущен на http://localhost:${PORT}`);
      console.log(`📊 Админ панель: http://localhost:8001/admin/`);
      console.log(`🌐 Фронтенд: http://localhost:3000`);
    });
  } catch (error) {
    console.error('❌ Ошибка запуска сервера:', error.message);
    if (error.message.includes('Таймаут')) {
      console.error('💡 Возможные причины:');
      console.error('   - Медленное подключение к базе данных');
      console.error('   - Большое количество данных для синхронизации');
      console.error('   - Проблемы с сетью');
    }
    process.exit(1);
  }
}

startServer();

// Обработка сигналов для корректного завершения
process.on('SIGINT', async () => {
  console.log('\n🛑 Получен сигнал SIGINT, завершение работы...');
  try {
    await sequelize.close();
    console.log('✅ Соединение с базой данных закрыто');
    process.exit(0);
  } catch (error) {
    console.error('❌ Ошибка при закрытии соединения с БД:', error.message);
    process.exit(1);
  }
});

process.on('SIGTERM', async () => {
  console.log('\n🛑 Получен сигнал SIGTERM, завершение работы...');
  try {
    await sequelize.close();
    console.log('✅ Соединение с базой данных закрыто');
    process.exit(0);
  } catch (error) {
    console.error('❌ Ошибка при закрытии соединения с БД:', error.message);
    process.exit(1);
  }
});