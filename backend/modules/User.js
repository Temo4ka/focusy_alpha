module.exports = (sequelize, DataTypes) => {
  const User = sequelize.define('User', {
    user_id: {
      type: DataTypes.BIGINT,
      primaryKey: true,
      allowNull: false
    },
    name: {
      type: DataTypes.STRING(100),
      allowNull: false
    },
    age: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    consent_given: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    experience_points: {
      type: DataTypes.INTEGER,
      defaultValue: 0
    },
    coins: {
      type: DataTypes.INTEGER,
      defaultValue: 0
    }
  }, {
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