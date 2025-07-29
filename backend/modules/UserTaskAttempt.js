module.exports = (sequelize, DataTypes) => {
  const UserTaskAttempt = sequelize.define('UserTaskAttempt', {
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
    timestamps: false
  });

  return UserTaskAttempt;
};