import React, { useState } from 'react';
import { useAuth } from './contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { userAPI, apiUtils } from './services/api';
import './styles.css';

export const QuickLogin = () => {
  const [selectedUserId, setSelectedUserId] = useState('1001');
  const { login, user, isAuthenticated, isLoading } = useAuth();
  const navigate = useNavigate();

  const demoUsers = [
    { id: '1001', name: 'Анна Петрова' },
    { id: '1002', name: 'Максим Волков' },
    { id: '1003', name: 'София Смирнова' },
    { id: '1004', name: 'Даниил Орлов' },
    { id: '1005', name: 'Полина Ветрова' }
  ];

  const handleQuickLogin = async () => {
    try {
      console.log('QuickLogin: попытка входа с user_id:', selectedUserId);
      const result = await login({ user_id: parseInt(selectedUserId) });
      
      if (result.success) {
        console.log('QuickLogin: вход успешен, переход на страницу заданий');
        navigate('/tasks');
      } else {
        console.error('QuickLogin: ошибка входа:', result.error);
      }
    } catch (error) {
      console.error('QuickLogin: ошибка входа:', error);
    }
  };

  const handleGoToTasks = () => {
    navigate('/tasks');
  };

  if (isLoading) {
    return <div className="quick-login-loading">Загрузка...</div>;
  }

  return (
    <div className="quick-login-container">
      <h2>Быстрый вход для тестирования</h2>
      
      {!isAuthenticated ? (
        <div className="quick-login-form">
          <p>Выберите пользователя для входа:</p>
          <select 
            value={selectedUserId} 
            onChange={(e) => setSelectedUserId(e.target.value)}
            className="quick-login-select"
          >
            {demoUsers.map(user => (
              <option key={user.id} value={user.id}>
                {user.name} (ID: {user.id})
              </option>
            ))}
          </select>
          
          <button 
            onClick={handleQuickLogin}
            className="quick-login-button"
          >
            Войти
          </button>
        </div>
      ) : (
        <div className="quick-login-success">
          <p>✅ Вы вошли как: <strong>{user?.name}</strong></p>
          <p>ID пользователя: <strong>{user?.user_id || user?.id}</strong></p>
          <p>Монеты: <strong>{user?.coins || 0}</strong></p>
          <p>Опыт: <strong>{user?.experience || 0}</strong></p>
          
          <div style={{ marginTop: '20px' }}>
            <button 
              onClick={handleGoToTasks}
              className="quick-login-button"
              style={{ marginRight: '10px' }}
            >
              Перейти к заданиям
            </button>
            
            <button 
              onClick={() => {
                console.log('Текущее состояние пользователя:', user);
                console.log('isAuthenticated:', isAuthenticated);
                console.log('localStorage user:', localStorage.getItem('user'));
                console.log('localStorage token:', localStorage.getItem('authToken'));
              }}
              className="quick-login-button"
              style={{ backgroundColor: '#28a745' }}
            >
              Отладка (консоль)
            </button>
            
            <button 
              onClick={async () => {
                try {
                  console.log('Принудительная перезагрузка данных пользователя...');
                  const freshUser = await userAPI.getUser(user?.user_id || user?.id);
                  console.log('Свежие данные:', freshUser);
                  const formattedUser = apiUtils.formatUserData(freshUser);
                  console.log('Отформатированные данные:', formattedUser);
                } catch (error) {
                  console.error('Ошибка перезагрузки:', error);
                }
              }}
              className="quick-login-button"
              style={{ backgroundColor: '#ffc107', color: '#000' }}
            >
              Перезагрузить данные
            </button>
          </div>
        </div>
      )}
      
      <div className="quick-login-info">
        <h3>Информация:</h3>
        <ul>
          <li>Это тестовая страница для быстрого входа</li>
          <li>Используются существующие пользователи из PostgreSQL</li>
          <li>После входа вы можете перейти к заданиям</li>
          <li>Все данные сохраняются в localStorage</li>
        </ul>
      </div>
    </div>
  );
};

export default QuickLogin;


