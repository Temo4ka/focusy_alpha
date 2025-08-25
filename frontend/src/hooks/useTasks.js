import { useState, useEffect, useCallback } from 'react';
import { taskAPI, apiUtils } from '../services/api';
import { useAuth } from '../contexts/AuthContext';

export const useTasks = (filters = {}) => {
  const [tasks, setTasks] = useState([]);
  const [currentTask, setCurrentTask] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const { user, updateUserStats } = useAuth();

  // Загрузка списка заданий
  const loadTasks = useCallback(async (newFilters = {}) => {
    try {
      setIsLoading(true);
      setError(null);
      
      const response = await taskAPI.getTasks({ ...filters, ...newFilters });
      setTasks(response);
    } catch (error) {
      const errorResult = apiUtils.handleError(error);
      setError(errorResult.error);
      console.error('Ошибка загрузки заданий:', error);
    } finally {
      setIsLoading(false);
    }
  }, [filters]);

  // Загрузка конкретного задания
  const loadTask = useCallback(async (taskId) => {
    try {
      setIsLoading(true);
      setError(null);
      
      const response = await taskAPI.getTask(taskId);
      setCurrentTask(response);
      return response;
    } catch (error) {
      const errorResult = apiUtils.handleError(error);
      setError(errorResult.error);
      console.error('Ошибка загрузки задания:', error);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Отправка ответа на задание
  const submitAnswer = useCallback(async (taskId, answer) => {
    if (!user) {
      setError('Необходимо войти в систему');
      return { success: false, error: 'Необходимо войти в систему' };
    }

    try {
      setIsLoading(true);
      setError(null);
      
      const response = await taskAPI.submitAnswer(taskId, answer, user.id);
      
      // Если ответ правильный, обновляем статистику пользователя
      if (response.correct && response.rewards) {
        const newExperience = user.experience + response.rewards.exp;
        const newCoins = user.coins + response.rewards.coins;
        
        updateUserStats({
          experience: newExperience,
          coins: newCoins
        });
      }
      
      return {
        success: true,
        correct: response.correct,
        message: response.message,
        rewards: response.rewards,
        correctAnswer: response.correct_answer
      };
    } catch (error) {
      const errorResult = apiUtils.handleError(error);
      setError(errorResult.error);
      console.error('Ошибка отправки ответа:', error);
      return errorResult;
    } finally {
      setIsLoading(false);
    }
  }, [user, updateUserStats]);

  // Получение статистики пользователя по заданиям
  const loadUserStats = useCallback(async () => {
    if (!user) return null;

    try {
      const response = await taskAPI.getUserStats(user.id);
      return response;
    } catch (error) {
      console.error('Ошибка загрузки статистики:', error);
      return null;
    }
  }, [user]);

  // Фильтрация заданий по сложности
  const filterByDifficulty = useCallback((difficulty) => {
    loadTasks({ difficulty });
  }, [loadTasks]);

  // Фильтрация заданий по предмету
  const filterBySubject = useCallback((subject) => {
    loadTasks({ subject });
  }, [loadTasks]);

  // Сброс фильтров
  const clearFilters = useCallback(() => {
    loadTasks({});
  }, [loadTasks]);

  // Автоматическая загрузка заданий при монтировании
  useEffect(() => {
    loadTasks();
  }, [loadTasks]);

  return {
    // Состояние
    tasks,
    currentTask,
    isLoading,
    error,
    
    // Действия
    loadTasks,
    loadTask,
    submitAnswer,
    loadUserStats,
    
    // Фильтры
    filterByDifficulty,
    filterBySubject,
    clearFilters,
    
    // Утилиты
    clearError: () => setError(null),
    setCurrentTask
  };
};
