module.exports = (sequelize, DataTypes) => {
  const Task = sequelize.define('Task', {
    task_id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      comment: 'ID задания'
    },
    type: {
      type: DataTypes.STRING(50),
      allowNull: false,
      comment: 'Тип задания'
    },
    difficulty: {
      type: DataTypes.STRING(10),
      defaultValue: 'medium',
      comment: 'Уровень сложности (easy|medium|hard)'
    },
    content: {
      type: DataTypes.TEXT,
      allowNull: false,
      comment: 'Содержание задания'
    },
    correct_answer: {
      type: DataTypes.TEXT,
      allowNull: false,
      comment: 'Правильный ответ'
    },
    is_active: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
      comment: 'Активно'
    }
  }, {
    tableName: 'tasks',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: false
  });

  Task.associate = (models) => {
    Task.hasMany(models.UserTaskAttempt, { foreignKey: 'task_id' });
  };

  return Task;
};