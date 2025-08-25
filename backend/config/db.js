const { Sequelize } = require('sequelize');
require('dotenv').config();

// Используем SQLite для тестирования (позже можно переключить на PostgreSQL)
const sequelize = new Sequelize({
  dialect: 'sqlite',
  storage: './database.sqlite',
  logging: false
});

// PostgreSQL конфигурация (раскомментируйте когда PostgreSQL будет настроен):
/*
const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASSWORD,
  {
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    dialect: 'postgres',
    logging: false,
    pool: {
      max: 5,
      min: 0,
      acquire: 30000,
      idle: 10000
    }
  }
);
*/

module.exports = sequelize;