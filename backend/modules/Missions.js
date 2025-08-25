module.exports = (sequelize, DataTypes) => {
  const Mission = sequelize.define('Mission', {
    mission_id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
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
    },
    is_active: {
      type: DataTypes.BOOLEAN,
      defaultValue: true
    }
  }, {
    tableName: 'missions',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: false
  });

  return Mission;
};