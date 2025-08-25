import axios from 'axios';

// Базовая конфигурация API
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001/api';

// Создаем экземпляр axios с базовой конфигурацией
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Интерцептор для добавления токена к запросам
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('authToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Интерцептор для обработки ответов
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Токен истек или невалиден
      localStorage.removeItem('authToken');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// API методы для пользователей
export const userAPI = {
  // Регистрация
  register: async (userData) => {
    const response = await api.post('/users/register', userData);
    return response.data;
  },

  // Вход
  login: async (credentials) => {
    const response = await api.post('/users/login', credentials);
    if (response.data.token) {
      localStorage.setItem('authToken', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.user));
    }
    return response.data;
  },

  // Выход
  logout: () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('user');
  },

  // Получение данных пользователя
  getUser: async (userId) => {
    const response = await api.get(`/users/${userId}`);
    return response.data;
  },

  // Получение текущего пользователя из localStorage
  getCurrentUser: () => {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  },

  // Проверка авторизации
  isAuthenticated: () => {
    return !!localStorage.getItem('authToken');
  }
};

// API методы для заданий
export const taskAPI = {
  // Получение всех заданий
  getTasks: async (filters = {}) => {
    const params = new URLSearchParams(filters);
    const response = await api.get(`/tasks?${params}`);
    return response.data;
  },

  // Получение конкретного задания
  getTask: async (taskId) => {
    const response = await api.get(`/tasks/${taskId}`);
    return response.data;
  },

  // Отправка ответа на задание
  submitAnswer: async (taskId, answer, userId) => {
    const response = await api.post(`/tasks/${taskId}/attempt`, {
      user_id: userId,
      selected_answer: answer
    });
    return response.data;
  },

  // Получение статистики по заданиям для пользователя
  getUserStats: async (userId) => {
    const response = await api.get(`/tasks/user/${userId}/stats`);
    return response.data;
  }
};

// API методы для миссий
export const missionAPI = {
  // Получение всех миссий
  getMissions: async () => {
    const response = await api.get('/missions');
    return response.data;
  },

  // Получение миссий для пользователя
  getUserMissions: async (userId) => {
    const response = await api.get(`/missions/user/${userId}`);
    return response.data;
  },

  // Начать миссию
  startMission: async (missionId, userId) => {
    const response = await api.post(`/missions/${missionId}/start`, {
      user_id: userId
    });
    return response.data;
  },

  // Завершить миссию
  completeMission: async (missionId, userId) => {
    const response = await api.post(`/missions/${missionId}/complete`, {
      user_id: userId
    });
    return response.data;
  },

  // Получение статистики по миссиям
  getMissionStats: async () => {
    const response = await api.get('/missions/stats');
    return response.data;
  }
};

// API методы для тестирования
export const testAPI = {
  // Проверка связи с сервером
  ping: async () => {
    const response = await api.get('/test/ping');
    return response.data;
  },

  // Получение демо пользователей
  getDemoUsers: async () => {
    const response = await api.get('/test/demo-users');
    return response.data;
  },

  // Получение демо заданий
  getDemoTasks: async () => {
    const response = await api.get('/test/demo-tasks');
    return response.data;
  },

  // Отправка демо ответа
  submitDemoAnswer: async (taskId, userId, answer) => {
    const response = await api.post('/test/demo-answer', {
      task_id: taskId,
      user_id: userId,
      answer: answer
    });
    return response.data;
  }
};

// Утилитарные функции
export const apiUtils = {
  // Обработка ошибок API
  handleError: (error) => {
    if (error.response) {
      // Сервер ответил с ошибкой
      const message = error.response.data?.error || 'Произошла ошибка сервера';
      return { success: false, error: message, status: error.response.status };
    } else if (error.request) {
      // Запрос был отправлен, но ответа не было
      return { success: false, error: 'Сервер не отвечает. Проверьте подключение к интернету.' };
    } else {
      // Что-то пошло не так при настройке запроса
      return { success: false, error: 'Произошла неизвестная ошибка' };
    }
  },

  // Форматирование данных пользователя
  formatUserData: (user) => {
    return {
      id: user.user_id || user.id,
      name: user.name,
      age: user.age,
      experience: user.experience_points || 0,
      coins: user.coins || 0,
      level: Math.floor((user.experience_points || 0) / 1000) + 1,
      subscribe: Boolean(user.subscribe)
    };
  },

  // Проверка состояния API
  checkHealth: async () => {
    try {
      const response = await api.get('/');
      return { success: true, data: response.data };
    } catch (error) {
      return apiUtils.handleError(error);
    }
  }
};

export default api;
