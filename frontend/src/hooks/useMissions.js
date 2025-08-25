import { useState, useEffect, useCallback } from 'react';
import { missionAPI, apiUtils } from '../services/api';
import { useAuth } from '../contexts/AuthContext';

export const useMissions = () => {
  const [missions, setMissions] = useState([]);
  const [userMissions, setUserMissions] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const { user, updateUserStats } = useAuth();

  // Загрузка всех миссий
  const loadMissions = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const response = await missionAPI.getMissions();
      setMissions(response);
    } catch (error) {
      const errorResult = apiUtils.handleError(error);
      setError(errorResult.error);
      console.error('Ошибка загрузки миссий:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Загрузка миссий пользователя с прогрессом
  const loadUserMissions = useCallback(async () => {
    if (!user) return;

    try {
      setIsLoading(true);
      setError(null);
      
      const response = await missionAPI.getUserMissions(user.id);
      setUserMissions(response);
    } catch (error) {
      const errorResult = apiUtils.handleError(error);
      setError(errorResult.error);
      console.error('Ошибка загрузки миссий пользователя:', error);
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  // Начать миссию
  const startMission = useCallback(async (missionId) => {
    if (!user) {
      setError('Необходимо войти в систему');
      return { success: false, error: 'Необходимо войти в систему' };
    }

    try {
      setIsLoading(true);
      setError(null);
      
      const response = await missionAPI.startMission(missionId, user.id);
      
      // Обновляем список миссий пользователя
      await loadUserMissions();
      
      return {
        success: true,
        message: response.message,
        mission: response.mission
      };
    } catch (error) {
      const errorResult = apiUtils.handleError(error);
      setError(errorResult.error);
      console.error('Ошибка начала миссии:', error);
      return errorResult;
    } finally {
      setIsLoading(false);
    }
  }, [user, loadUserMissions]);

  // Завершить миссию
  const completeMission = useCallback(async (missionId) => {
    if (!user) {
      setError('Необходимо войти в систему');
      return { success: false, error: 'Необходимо войти в систему' };
    }

    try {
      setIsLoading(true);
      setError(null);
      
      const response = await missionAPI.completeMission(missionId, user.id);
      
      // Обновляем статистику пользователя
      if (response.rewards) {
        const newExperience = user.experience + response.rewards.exp;
        const newCoins = user.coins + response.rewards.coins;
        
        updateUserStats({
          experience: newExperience,
          coins: newCoins
        });
      }
      
      // Обновляем список миссий пользователя
      await loadUserMissions();
      
      return {
        success: true,
        message: response.message,
        mission: response.mission,
        rewards: response.rewards,
        completedAt: response.completed_at
      };
    } catch (error) {
      const errorResult = apiUtils.handleError(error);
      setError(errorResult.error);
      console.error('Ошибка завершения миссии:', error);
      return errorResult;
    } finally {
      setIsLoading(false);
    }
  }, [user, updateUserStats, loadUserMissions]);

  // Получение статистики по миссиям
  const loadMissionStats = useCallback(async () => {
    try {
      const response = await missionAPI.getMissionStats();
      return response;
    } catch (error) {
      console.error('Ошибка загрузки статистики миссий:', error);
      return [];
    }
  }, []);

  // Проверка возможности завершить миссию
  const canCompleteMission = useCallback((mission) => {
    return mission.user_progress?.can_complete || false;
  }, []);

  // Получение процента выполнения миссии
  const getMissionProgress = useCallback((mission) => {
    return mission.user_progress?.percentage || 0;
  }, []);

  // Проверка завершена ли миссия
  const isMissionCompleted = useCallback((mission) => {
    return mission.user_progress?.is_completed || false;
  }, []);

  // Получение миссий по уровню сложности
  const getMissionsByDifficulty = useCallback((difficulty) => {
    return userMissions.filter(mission => mission.difficulty_level === difficulty);
  }, [userMissions]);

  // Получение активных миссий пользователя
  const getActiveMissions = useCallback(() => {
    return userMissions.filter(mission => 
      !mission.user_progress?.is_completed && 
      mission.user_progress?.current > 0
    );
  }, [userMissions]);

  // Получение завершенных миссий пользователя
  const getCompletedMissions = useCallback(() => {
    return userMissions.filter(mission => mission.user_progress?.is_completed);
  }, [userMissions]);

  // Автоматическая загрузка данных при монтировании и изменении пользователя
  useEffect(() => {
    loadMissions();
  }, [loadMissions]);

  useEffect(() => {
    if (user) {
      loadUserMissions();
    }
  }, [user, loadUserMissions]);

  return {
    // Состояние
    missions,
    userMissions,
    isLoading,
    error,
    
    // Действия
    loadMissions,
    loadUserMissions,
    startMission,
    completeMission,
    loadMissionStats,
    
    // Утилиты
    canCompleteMission,
    getMissionProgress,
    isMissionCompleted,
    getMissionsByDifficulty,
    getActiveMissions,
    getCompletedMissions,
    
    // Очистка
    clearError: () => setError(null)
  };
};
