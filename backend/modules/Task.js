module.exports = (sequelize, DataTypes) => {
  const Task = sequelize.define('Task', {
    type: {
      type: DataTypes.STRING(20),
      allowNull: false
    },
    difficulty: {
      type: DataTypes.INTEGER,
      validate: {
        min: 1,
        max: 3
      }
    },
    content: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    correct_answer: {
      type: DataTypes.TEXT,
      allowNull: false
    }
  }, {
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: false
  });

  Task.associate = (models) => {
    Task.hasMany(models.UserTaskAttempt, { foreignKey: 'task_id' });
  };

  return Task;
};