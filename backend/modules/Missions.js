module.exports = (sequelize, DataTypes) => {
  const Mission = sequelize.define('Mission', {
    title: {
      type: DataTypes.STRING(100),
      allowNull: false
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    reward_exp: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    reward_coins: {
      type: DataTypes.INTEGER,
      allowNull: false
    }
  }, {
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: false
  });

  Mission.associate = (models) => {
    Mission.hasMany(models.UserMission, { foreignKey: 'mission_id' });
  };

  return Mission;
};