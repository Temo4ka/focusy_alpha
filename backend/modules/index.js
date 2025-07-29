const sequelize = require('../config/db');
const User = require('./User');
const Task = require('./Task');
const Mission = require('./Mission');
const UserMission = require('./UserMission');
const UserTaskAttempt = require('./UserTaskAttempt');

// Установка связей
User.belongsToMany(Mission, { through: UserMission, foreignKey: 'user_id' });
Mission.belongsToMany(User, { through: UserMission, foreignKey: 'mission_id' });

User.hasMany(UserTaskAttempt, { foreignKey: 'user_id' });
UserTaskAttempt.belongsTo(User, { foreignKey: 'user_id' });

Task.hasMany(UserTaskAttempt, { foreignKey: 'task_id' });
UserTaskAttempt.belongsTo(Task, { foreignKey: 'task_id' });

// Синхронизация с базой данных
sequelize.sync({ alter: true })
  .then(() => console.log('Таблицы синхронизированы'))
  .catch(err => console.error('Ошибка синхронизации:', err));

module.exports = {
  sequelize,
  User,
  Task,
  Mission,
  UserMission,
  UserTaskAttempt
};