import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { userAPI, apiUtils } from './services/api';
import { useAuth } from './contexts/AuthContext';
import './styles.css';

export const QuickLogin = () => {
  const [userId, setUserId] = useState('');
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    const trimmed = String(userId).trim();
    if (!trimmed) {
      setError('Введите ID пользователя');
      return;
    }

    setIsLoading(true);
    try {
      // Используем контекстный login, чтобы обновить глобальное состояние пользователя
      const result = await login({ user_id: trimmed });
      if (result?.success) {
        navigate('/ProfilePage');
      } else {
        setError(result?.error || 'Такого пользователя не существует');
      }
    } catch (err) {
      const er = apiUtils.handleError(err);
      // 404 → пользователь не найден
      setError(er?.error || 'Ошибка запроса');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="app-container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh' }}>
      <div className="main-container" style={{ maxWidth: 360, width: '100%', padding: 16 }}>
        <h1 className="logo-title" style={{ textAlign: 'center', marginBottom: 16 }}>FOCUSY</h1>
        <div className="subject-card" style={{ padding: 16, display: 'flex', flexDirection: 'column', alignItems: 'center', transform: 'translateX(-50%)' }}>
          <div style={{ textAlign: 'center', marginBottom: 12, fontSize: 16, fontWeight: 600 }}>
            Быстрый вход
          </div>
          <form onSubmit={handleSubmit}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12, alignItems: 'center' }}>
              <input
                type="text"
                inputMode="numeric"
                placeholder="Введите ваш user_id"
                value={userId}
                onChange={(e) => setUserId(e.target.value)}
                className="btn-text"
                style={{
                  padding: '10px 12px',
                  borderRadius: 8,
                  border: '1px solid #e0e0e0',
                  outline: 'none',
                  textAlign: 'center',
                  width: '100%',
                  boxSizing: 'border-box'
                }}
              />
              <button
                type="submit"
                disabled={isLoading}
                className="profile-btn"
                style={{
                  alignSelf: 'center',
                  width: '100%',
                  maxWidth: 200,
                  marginTop: 8,
                  position: 'static',
                  display: 'block'
                }}
              >
                <div className="btn-content outlined" style={{ justifyContent: 'center', width: '100%' }}>
                  <span className="btn-text">{isLoading ? 'Запрос...' : 'Запрос'}</span>
                </div>
              </button>
            </div>
          </form>

          {error && (
            <div style={{ color: '#E34B4B', marginTop: 12, fontSize: 14, textAlign: 'center' }}>{error}</div>
          )}
        </div>
      </div>
    </div>
  );
};

export default QuickLogin;


