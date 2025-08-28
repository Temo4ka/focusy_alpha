const sequelize = require('../config/db');
const { DataTypes } = require('sequelize');

// Инициализация моделей
const Subject = require('./Subject')(sequelize, DataTypes);
const User = require('./User')(sequelize, DataTypes);
const Task = require('./Task')(sequelize, DataTypes);
const Mission = require('./Missions')(sequelize, DataTypes);
const UserMission = require('./UserMission')(sequelize, DataTypes);
const UserTaskAttempt = require('./UserTaskAttempt')(sequelize, DataTypes);

// Установка связей (явные FK и таблицы соответствуют Django моделям)
Subject.hasMany(Task, { foreignKey: 'subject_id' });
Task.belongsTo(Subject, { foreignKey: 'subject_id' });

User.hasMany(UserMission, { foreignKey: 'user_id' });
Mission.hasMany(UserMission, { foreignKey: 'mission_id' });
UserMission.belongsTo(User, { foreignKey: 'user_id' });
UserMission.belongsTo(Mission, { foreignKey: 'mission_id' });

User.hasMany(UserTaskAttempt, { foreignKey: 'user_id' });
UserTaskAttempt.belongsTo(User, { foreignKey: 'user_id' });

Task.hasMany(UserTaskAttempt, { foreignKey: 'task_id' });
UserTaskAttempt.belongsTo(Task, { foreignKey: 'task_id' });

// Синхронизация будет выполнена в server.js

module.exports = {
  sequelize,
  Subject,
  User,
  Task,
  Mission,
  UserMission,
  UserTaskAttempt
};