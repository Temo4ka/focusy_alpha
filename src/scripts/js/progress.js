// progress.js
document.addEventListener('DOMContentLoaded', () => {
    // Обновление прогресса выполнения задач
    const progress = document.querySelector('.progress');
    const progressValue = document.querySelector('.progress-bar span');
  
    // Пример данных
    const taskCompletionPercentage = 75;
  
    // Установка значения прогресса
    progress.style.width = `${taskCompletionPercentage}%`;
    progressValue.textContent = `${taskCompletionPercentage}%`;
  });