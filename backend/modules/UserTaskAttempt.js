module.exports = (sequelize, DataTypes) => {
  const UserTaskAttempt = sequelize.define('UserTaskAttempt', {
    attempt_id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    user_id: {
      type: DataTypes.BIGINT,
      allowNull: false
    },
    task_id: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    selected_answer: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    is_correct: {
      type: DataTypes.BOOLEAN,
      allowNull: false
    },
    attempt_time: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW
    }
  }, {
    tableName: 'user_task_attempts',
    timestamps: false
  });

  return UserTaskAttempt;
};