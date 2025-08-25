import React, { useState, useEffect } from 'react';
import { testAPI, apiUtils } from './services/api';

const TestIntegration = () => {
  const [status, setStatus] = useState({
    backend: 'проверяется...',
    data: null,
    error: null
  });
  const [demoUsers, setDemoUsers] = useState([]);
  const [demoTasks, setDemoTasks] = useState([]);
  const [testResult, setTestResult] = useState(null);

  useEffect(() => {
    checkBackendConnection();
  }, []);

  const checkBackendConnection = async () => {
    try {
      // Проверяем связь с бэкендом
      const pingResult = await testAPI.ping();
      setStatus({
        backend: '✅ Подключен',
        data: pingResult,
        error: null
      });

      // Загружаем демо данные
      loadDemoData();
    } catch (error) {
      setStatus({
        backend: '❌ Не подключен',
        data: null,
        error: apiUtils.handleError(error).error
      });
    }
  };

  const loadDemoData = async () => {
    try {
      const [usersData, tasksData] = await Promise.all([
        testAPI.getDemoUsers(),
        testAPI.getDemoTasks()
      ]);
      
      setDemoUsers(usersData.users);
      setDemoTasks(tasksData.tasks);
    } catch (error) {
      console.error('Ошибка загрузки демо данных:', error);
    }
  };

  const testAnswer = async (taskId, answer) => {
    try {
      const result = await testAPI.submitDemoAnswer(taskId, 1001, answer);
      setTestResult(result);
    } catch (error) {
      setTestResult({ error: apiUtils.handleError(error).error });
    }
  };

  return (
    <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
      <h1>🔧 Тест интеграции Frontend ↔ Backend</h1>
      
      {/* Статус подключения */}
      <div style={{ 
        padding: '15px', 
        marginBottom: '20px', 
        backgroundColor: status.backend.includes('✅') ? '#d4edda' : '#f8d7da',
        border: '1px solid ' + (status.backend.includes('✅') ? '#c3e6cb' : '#f5c6cb'),
        borderRadius: '5px'
      }}>
        <h3>Статус бэкенда: {status.backend}</h3>
        {status.data && (
          <div>
            <p><strong>Сообщение:</strong> {status.data.message}</p>
            <p><strong>Время:</strong> {status.data.timestamp}</p>
            <p><strong>Эндпоинты:</strong></p>
            <ul>
              {Object.entries(status.data.endpoints).map(([key, value]) => (
                <li key={key}><code>{value}</code></li>
              ))}
            </ul>
          </div>
        )}
        {status.error && (
          <p style={{ color: 'red' }}><strong>Ошибка:</strong> {status.error}</p>
        )}
      </div>

      {/* Демо пользователи */}
      {demoUsers.length > 0 && (
        <div style={{ marginBottom: '20px' }}>
          <h3>👥 Демо пользователи</h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '10px' }}>
            {demoUsers.map(user => (
              <div key={user.user_id} style={{ 
                padding: '10px', 
                border: '1px solid #ddd', 
                borderRadius: '5px',
                backgroundColor: '#f9f9f9'
              }}>
                <h4>{user.name}</h4>
                <p>ID: {user.user_id}</p>
                <p>Класс: {user.user_class}</p>
                <p>Опыт: {user.experience_points}</p>
                <p>Монеты: {user.coins}</p>
                <p>Уровень: {user.level}</p>
                <p>Подписка: {user.subscribe ? '✅' : '❌'}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Демо задания */}
      {demoTasks.length > 0 && (
        <div style={{ marginBottom: '20px' }}>
          <h3>📝 Демо задания</h3>
          {demoTasks.map(task => (
            <div key={task.task_id} style={{ 
              padding: '15px', 
              border: '1px solid #ddd', 
              borderRadius: '5px',
              marginBottom: '10px',
              backgroundColor: '#f9f9f9'
            }}>
              <h4>Задание {task.task_id}: {task.type}</h4>
              <p><strong>Предмет:</strong> {task.subject}</p>
              <p><strong>Сложность:</strong> {task.difficulty}</p>
              <p><strong>Содержание:</strong></p>
              <div style={{ 
                whiteSpace: 'pre-line', 
                backgroundColor: 'white', 
                padding: '10px', 
                border: '1px solid #eee',
                borderRadius: '3px'
              }}>
                {task.content}
              </div>
              
              {/* Тестовые кнопки ответов */}
              <div style={{ marginTop: '10px' }}>
                <p><strong>Тест ответов:</strong></p>
                {task.task_id === 1 && (
                  <div>
                    <button onClick={() => testAnswer(1, '1')} style={{ margin: '2px' }}>1</button>
                    <button onClick={() => testAnswer(1, '2')} style={{ margin: '2px' }}>2 (правильный)</button>
                    <button onClick={() => testAnswer(1, '3')} style={{ margin: '2px' }}>3</button>
                    <button onClick={() => testAnswer(1, '4')} style={{ margin: '2px' }}>4</button>
                  </div>
                )}
                {task.task_id === 3 && (
                  <div>
                    <button onClick={() => testAnswer(3, 'x = 3')} style={{ margin: '2px' }}>x = 3</button>
                    <button onClick={() => testAnswer(3, 'x = 4')} style={{ margin: '2px' }}>x = 4 (правильный)</button>
                    <button onClick={() => testAnswer(3, 'x = 5')} style={{ margin: '2px' }}>x = 5</button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Результат тестирования */}
      {testResult && (
        <div style={{ 
          padding: '15px', 
          marginTop: '20px',
          backgroundColor: testResult.is_correct ? '#d4edda' : '#f8d7da',
          border: '1px solid ' + (testResult.is_correct ? '#c3e6cb' : '#f5c6cb'),
          borderRadius: '5px'
        }}>
          <h3>🧪 Результат теста</h3>
          {testResult.error ? (
            <p style={{ color: 'red' }}>Ошибка: {testResult.error}</p>
          ) : (
            <div>
              <p><strong>Задание:</strong> {testResult.task_id}</p>
              <p><strong>Пользователь:</strong> {testResult.user_id}</p>
              <p><strong>Ответ:</strong> {testResult.answer}</p>
              <p><strong>Результат:</strong> {testResult.is_correct ? '✅ Правильно' : '❌ Неправильно'}</p>
              <p><strong>Сообщение:</strong> {testResult.message}</p>
              {testResult.rewards && (
                <p><strong>Награды:</strong> +{testResult.rewards.exp} опыта, +{testResult.rewards.coins} монет</p>
              )}
            </div>
          )}
        </div>
      )}

      {/* Кнопка обновления */}
      <div style={{ marginTop: '20px' }}>
        <button 
          onClick={checkBackendConnection}
          style={{
            padding: '10px 20px',
            backgroundColor: '#007bff',
            color: 'white',
            border: 'none',
            borderRadius: '5px',
            cursor: 'pointer'
          }}
        >
          🔄 Обновить статус
        </button>
      </div>

      {/* Инструкции */}
      <div style={{ 
        marginTop: '30px', 
        padding: '15px', 
        backgroundColor: '#e7f3ff', 
        border: '1px solid #b8daff',
        borderRadius: '5px'
      }}>
        <h3>📋 Инструкции</h3>
        <ol>
          <li>Убедитесь, что бэкенд запущен на <code>http://localhost:3001</code></li>
          <li>Статус должен показывать "✅ Подключен"</li>
          <li>Должны загрузиться демо пользователи и задания</li>
          <li>Протестируйте отправку ответов на задания</li>
          <li>Если есть ошибки, проверьте консоль браузера</li>
        </ol>
      </div>
    </div>
  );
};

export default TestIntegration;
