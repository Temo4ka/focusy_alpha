module.exports = (sequelize, DataTypes) => {
  const Task = sequelize.define('Task', {
    task_id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      comment: 'ID задания'
    },
    subject_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      comment: 'Ссылка на предмет'
    },
    type: {
      type: DataTypes.STRING(50),
      allowNull: false,
      comment: 'Тип задания'
    },
    difficulty: {
      type: DataTypes.ENUM('easy', 'medium', 'hard'),
      defaultValue: 'medium',
      comment: 'Уровень сложности'
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
    tableName: 'content_management_task',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: false
  });

  Task.associate = (models) => {
    Task.hasMany(models.UserTaskAttempt, { foreignKey: 'task_id' });
  };

  return Task;
};