module.exports = (sequelize, DataTypes) => {
  const User = sequelize.define('User', {
    user_id: {
      type: DataTypes.BIGINT,
      primaryKey: true,
      allowNull: false,
      comment: 'Telegram ID пользователя'
    },
    name: {
      type: DataTypes.STRING(100),
      allowNull: false,
      comment: 'Имя пользователя'
    },
    user_class: {
      type: DataTypes.STRING(10),
      defaultValue: "4",
      comment: 'В каком классе учится'
    },
    consent_given: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
      comment: 'Согласие на обработку данных'
    },
    experience_points: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
      comment: 'Очки опыта'
    },
    coins: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
      comment: 'Монеты'
    },
    subscribe: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
      comment: 'Подписка'
    }
  }, {
    tableName: 'users',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: false
  });

  User.associate = (models) => {
    User.hasMany(models.UserMission, { foreignKey: 'user_id' });
    User.hasMany(models.UserTaskAttempt, { foreignKey: 'user_id' });
  };

  return User;
};