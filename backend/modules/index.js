const sequelize = require('../config/db');
const { DataTypes } = require('sequelize');

// Инициализация моделей
const User = require('./User')(sequelize, DataTypes);
const Task = require('./Task')(sequelize, DataTypes);
const Mission = require('./Missions')(sequelize, DataTypes);
const UserMission = require('./UserMission')(sequelize, DataTypes);
const UserTaskAttempt = require('./UserTaskAttempt')(sequelize, DataTypes);

// Установка связей
User.belongsToMany(Mission, { through: UserMission, foreignKey: 'user_id' });
Mission.belongsToMany(User, { through: UserMission, foreignKey: 'mission_id' });

User.hasMany(UserTaskAttempt, { foreignKey: 'user_id' });
UserTaskAttempt.belongsTo(User, { foreignKey: 'user_id' });

Task.hasMany(UserTaskAttempt, { foreignKey: 'task_id' });
UserTaskAttempt.belongsTo(Task, { foreignKey: 'task_id' });

// Синхронизация будет выполнена в server.js

module.exports = {
  sequelize,
  User,
  Task,
  Mission,
  UserMission,
  UserTaskAttempt
};