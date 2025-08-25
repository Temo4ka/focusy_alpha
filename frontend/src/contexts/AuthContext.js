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
        dispatch({ type: AuthActionTypes.SET_LOADING, payload: true });
        
        const currentUser = userAPI.getCurrentUser();
        if (currentUser && userAPI.isAuthenticated()) {
          // Проверяем актуальность данных пользователя
          try {
            const freshUserData = await userAPI.getUser(currentUser.id || currentUser.user_id);
            const formattedUser = apiUtils.formatUserData(freshUserData);
            dispatch({ type: AuthActionTypes.SET_USER, payload: formattedUser });
          } catch (error) {
            // Если не удалось получить свежие данные, используем кэшированные
            const formattedUser = apiUtils.formatUserData(currentUser);
            dispatch({ type: AuthActionTypes.SET_USER, payload: formattedUser });
          }
        } else {
          dispatch({ type: AuthActionTypes.SET_LOADING, payload: false });
        }
      } catch (error) {
        console.error('Ошибка проверки аутентификации:', error);
        dispatch({ type: AuthActionTypes.SET_ERROR, payload: 'Ошибка проверки аутентификации' });
      }
    };

    checkAuth();
  }, []);

  // Функция входа
  const login = async (credentials) => {
    try {
      dispatch({ type: AuthActionTypes.SET_LOADING, payload: true });
      dispatch({ type: AuthActionTypes.SET_ERROR, payload: null });

      const response = await userAPI.login(credentials);
      const formattedUser = apiUtils.formatUserData(response.user);
      
      dispatch({ type: AuthActionTypes.SET_USER, payload: formattedUser });
      return { success: true, user: formattedUser };
    } catch (error) {
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

      const response = await userAPI.register(userData);
      
      // После регистрации автоматически входим
      const loginResult = await login({
        email: userData.email,
        password: userData.password
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
    userAPI.logout();
    dispatch({ type: AuthActionTypes.LOGOUT });
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
        const freshUserData = await userAPI.getUser(state.user.id);
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
