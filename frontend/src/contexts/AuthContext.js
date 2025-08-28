import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { userAPI, apiUtils } from '../services/api';

// Начальное состояние
const initialState = {
  user: null,
  isAuthenticated: false,
  isLoading: true,
  error: null
};

// Типы действий
const AuthActionTypes = {
  SET_LOADING: 'SET_LOADING',
  SET_USER: 'SET_USER',
  SET_ERROR: 'SET_ERROR',
  LOGOUT: 'LOGOUT',
  UPDATE_USER_STATS: 'UPDATE_USER_STATS'
};

// Reducer для управления состоянием аутентификации
const authReducer = (state, action) => {
  switch (action.type) {
    case AuthActionTypes.SET_LOADING:
      return {
        ...state,
        isLoading: action.payload
      };

    case AuthActionTypes.SET_USER:
      return {
        ...state,
        user: action.payload,
        isAuthenticated: !!action.payload,
        isLoading: false,
        error: null
      };

    case AuthActionTypes.SET_ERROR:
      return {
        ...state,
        error: action.payload,
        isLoading: false
      };

    case AuthActionTypes.LOGOUT:
      return {
        ...state,
        user: null,
        isAuthenticated: false,
        isLoading: false,
        error: null
      };

    case AuthActionTypes.UPDATE_USER_STATS:
      return {
        ...state,
        user: state.user ? {
          ...state.user,
          experience: action.payload.experience || state.user.experience,
          coins: action.payload.coins || state.user.coins,
          level: Math.floor((action.payload.experience || state.user.experience) / 1000) + 1
        } : null
      };

    default:
      return state;
  }
};

// Создаем контекст
const AuthContext = createContext();

// Провайдер контекста
export const AuthProvider = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);

  // Проверяем аутентификацию при загрузке приложения
  useEffect(() => {
    const checkAuth = async () => {
      try {
        console.log('AuthContext: проверка аутентификации...');
        dispatch({ type: AuthActionTypes.SET_LOADING, payload: true });
        
        const currentUser = userAPI.getCurrentUser();
        const hasToken = userAPI.isAuthenticated();
        
        console.log('AuthContext: текущий пользователь из localStorage:', currentUser);
        console.log('AuthContext: есть токен:', hasToken);
        
        if (currentUser && hasToken) {
          console.log('AuthContext: пользователь найден в localStorage, проверяем актуальность...');
          // Проверяем актуальность данных пользователя
          try {
            // Используем правильный ID для PostgreSQL
            const userId = currentUser.user_id || currentUser.id;
            console.log('AuthContext: используем ID пользователя:', userId);
            
            const freshUserData = await userAPI.getUser(userId);
            console.log('AuthContext: получены свежие данные пользователя:', freshUserData);
            const formattedUser = apiUtils.formatUserData(freshUserData);
            console.log('AuthContext: отформатированный пользователь:', formattedUser);
            dispatch({ type: AuthActionTypes.SET_USER, payload: formattedUser });
            console.log('AuthContext: пользователь установлен из API');
          } catch (error) {
            console.log('AuthContext: не удалось получить свежие данные, используем кэшированные');
            // Если не удалось получить свежие данные, используем кэшированные
            const formattedUser = apiUtils.formatUserData(currentUser);
            console.log('AuthContext: отформатированный пользователь из кэша:', formattedUser);
            dispatch({ type: AuthActionTypes.SET_USER, payload: formattedUser });
            console.log('AuthContext: пользователь установлен из кэша');
          }
        } else {
          console.log('AuthContext: пользователь не найден или не авторизован, сбрасываем состояние');
          // Сбрасываем состояние и localStorage
          localStorage.removeItem('authToken');
          localStorage.removeItem('user');
          dispatch({ type: AuthActionTypes.LOGOUT });
        }
      } catch (error) {
        console.error('AuthContext: ошибка проверки аутентификации:', error);
        dispatch({ type: AuthActionTypes.SET_ERROR, payload: 'Ошибка проверки аутентификации' });
      }
    };

    checkAuth();
  }, []);

  // Функция входа
  const login = async (credentials) => {
    try {
      console.log('AuthContext: попытка входа с credentials:', credentials);
      
      dispatch({ type: AuthActionTypes.SET_LOADING, payload: true });
      dispatch({ type: AuthActionTypes.SET_ERROR, payload: null });

      const response = await userAPI.login(credentials);
      console.log('AuthContext: ответ от API:', response);
      
      if (response.user) {
        const formattedUser = apiUtils.formatUserData(response.user);
        console.log('AuthContext: отформатированный пользователь:', formattedUser);
        
        dispatch({ type: AuthActionTypes.SET_USER, payload: formattedUser });
        console.log('AuthContext: пользователь установлен в состояние');
        
        return { success: true, user: formattedUser };
      } else {
        console.error('AuthContext: неверный формат ответа от сервера');
        throw new Error('Неверный формат ответа от сервера');
      }
    } catch (error) {
      console.error('AuthContext: ошибка входа:', error);
      const errorResult = apiUtils.handleError(error);
      dispatch({ type: AuthActionTypes.SET_ERROR, payload: errorResult.error });
      return errorResult;
    }
  };

  // Функция регистрации
  const register = async (userData) => {
    try {
      dispatch({ type: AuthActionTypes.SET_LOADING, payload: true });
      dispatch({ type: AuthActionTypes.SET_ERROR, payload: null });

      await userAPI.register(userData);
      
      // После регистрации автоматически входим
      const loginResult = await login({
        user_id: userData.user_id,
        name: userData.name
      });
      
      return loginResult;
    } catch (error) {
      const errorResult = apiUtils.handleError(error);
      dispatch({ type: AuthActionTypes.SET_ERROR, payload: errorResult.error });
      return errorResult;
    }
  };

  // Функция выхода
  const logout = () => {
    console.log('AuthContext: выход из учетной записи');
    userAPI.logout();
    dispatch({ type: AuthActionTypes.LOGOUT });
    console.log('AuthContext: состояние сброшено');
  };

  // Функция обновления статистики пользователя
  const updateUserStats = (newStats) => {
    dispatch({ type: AuthActionTypes.UPDATE_USER_STATS, payload: newStats });
    
    // Обновляем данные в localStorage
    if (state.user) {
      const updatedUser = {
        ...state.user,
        experience: newStats.experience || state.user.experience,
        coins: newStats.coins || state.user.coins
      };
      localStorage.setItem('user', JSON.stringify(updatedUser));
    }
  };

  // Функция перезагрузки данных пользователя
  const refreshUser = async () => {
    if (state.user && userAPI.isAuthenticated()) {
      try {
        // Используем правильный ID для PostgreSQL
        const userId = state.user.user_id || state.user.id;
        console.log('AuthContext: обновляем пользователя с ID:', userId);
        
        const freshUserData = await userAPI.getUser(userId);
        const formattedUser = apiUtils.formatUserData(freshUserData);
        dispatch({ type: AuthActionTypes.SET_USER, payload: formattedUser });
        return formattedUser;
      } catch (error) {
        console.error('Ошибка обновления данных пользователя:', error);
        return null;
      }
    }
    return null;
  };

  // Значение контекста
  const contextValue = {
    // Состояние
    user: state.user,
    isAuthenticated: state.isAuthenticated,
    isLoading: state.isLoading,
    error: state.error,
    
    // Действия
    login,
    register,
    logout,
    updateUserStats,
    refreshUser,
    
    // Утилиты
    clearError: () => dispatch({ type: AuthActionTypes.SET_ERROR, payload: null })
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};

// Хук для использования контекста
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth должен использоваться внутри AuthProvider');
  }
  return context;
};

export default AuthContext;
