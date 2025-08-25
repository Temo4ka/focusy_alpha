module.exports = (sequelize, DataTypes) => {
  const UserMission = sequelize.define('UserMission', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    user_id: {
      type: DataTypes.BIGINT,
      allowNull: false
    },
    mission_id: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    is_completed: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    completed_at: {
      type: DataTypes.DATE,
      allowNull: true
    }
  }, {
    tableName: 'user_missions',
    timestamps: false,
    indexes: [
      { unique: true, fields: ['user_id', 'mission_id'] }
    ]
  });

  return UserMission;
};