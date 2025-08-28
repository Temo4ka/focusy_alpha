import React, { useMemo, useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import x2 from "./assets/2.png";
import frame56 from "./assets/frame56.svg";
import i2 from "./assets/i2.png";
import leaderboard from "./assets/leaderboard.png";
import dogHouse from "./assets/dog-house.png";
import comboChart from "./assets/combo-chart.png";
import "./styles.css";
import arrow8 from "./assets/arrow8.png";
import { useAuth } from "./contexts/AuthContext";
import { taskAPI } from "./services/api";

const TaskIcon = ({ folder, fallbackText }) => {
  const candidates = useMemo(
    () => [
      `/${folder}/icon.png`,
      `/${folder}/icon.jpg`,
      `/${folder}/image.png`,
      `/${folder}/image.jpg`,
      `/${folder}/1.png`,
      `/${folder}/1.jpg`,
    ],
    [folder]
  );

  const [srcIdx, setSrcIdx] = useState(0);
  const src = candidates[srcIdx];

  if (!src) {
    return <div className="taskselect-icon-fallback">{fallbackText}</div>;
  }

  return (
    <img
      className="taskselect-icon-img"
      src={src}
      alt={folder}
      onError={() => setSrcIdx((i) => i + 1)}
    />
  );
};

export const TasksSelectionPage = () => {
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  const [activeNav, setActiveNav] = useState("");
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  console.log('TasksSelectionPage: рендер компонента', {
    user,
    isAuthenticated,
    authLoading,
    tasksCount: tasks.length,
    loading,
    error
  });

  const navigationItems = [
    { id: "rating", label: "рейтинг", icon: leaderboard, iconAlt: "Leaderboard", isActive: activeNav === "rating" },
    { id: "home", label: "главная", icon: dogHouse, iconAlt: "Dog house", isActive: activeNav === "home" },
    { id: "statistics", label: "статистика", icon: comboChart, iconAlt: "Combo chart", isActive: activeNav === "statistics" },
  ];

  const handleNavClick = (id) => {
    setActiveNav(id);
    if (id === "home") navigate("/");
    if (id === "rating") navigate("/rating");
  };

  const handleProfileClick = () => navigate("/ProfilePage");

  // Функция загрузки заданий с прогрессом пользователя
  const loadTasks = useCallback(async () => {
    console.log('TasksSelectionPage: loadTasks вызвана для пользователя:', user);
    
    if (!user) {
      console.log('TasksSelectionPage: пользователь не найден, сброс загрузки');
      setLoading(false);
      setError('Пользователь не авторизован');
      return;
    }
    
    // Получаем правильный ID пользователя для PostgreSQL
    const userId = user.user_id || user.id;
    if (!userId) {
      console.log('TasksSelectionPage: ID пользователя не найден:', user);
      setLoading(false);
      setError('ID пользователя не найден');
      return;
    }
    
    try {
      setLoading(true);
      setError(null);
      
      // Получаем ID предмета "Русский язык" из PostgreSQL (ID = 1)
      const subjectId = 1;
      console.log('TasksSelectionPage: запрос заданий для предмета:', subjectId, 'пользователя:', userId);
      
      const tasksData = await taskAPI.getTasksBySubject(subjectId, userId);
      console.log('TasksSelectionPage: получены задания:', tasksData);
      
      if (!tasksData || tasksData.length === 0) {
        console.log('TasksSelectionPage: задания не найдены');
        setTasks([]);
        return;
      }
      
      // Группируем задания по типу и вычисляем прогресс
      const tasksByType = {};
      tasksData.forEach(task => {
        const taskType = task.type;
        if (!tasksByType[taskType]) {
          tasksByType[taskType] = {
            type: taskType,
            total: 0,
            completed: 0,
            correct: 0,
            tasks: []
          };
        }
        
        tasksByType[taskType].total++;
        if (task.user_progress && task.user_progress.is_completed) {
          tasksByType[taskType].completed++;
          if (task.user_progress.is_correct) {
            tasksByType[taskType].correct++;
          }
        }
        tasksByType[taskType].tasks.push(task);
      });
      
      console.log('TasksSelectionPage: сгруппированные задания:', tasksByType);
      
      // Преобразуем в формат для отображения
      const formattedTasks = Object.values(tasksByType).map(typeData => {
        const progress = typeData.total > 0 ? Math.round((typeData.completed / typeData.total) * 100) : 0;
        const color = progress >= 80 ? "#4CAF50" : progress >= 40 ? "#C2B900" : "#E34B4B";
        
        return {
          id: typeData.type,
          folder: `Ex_${typeData.type.split('_')[1]}`,
          title: typeData.type,
          subtitle: getTaskDescription(typeData.type),
          iconText: getTaskIcon(typeData.type),
          progress: progress,
          color: color,
          total: typeData.total,
          completed: typeData.completed,
          correct: typeData.correct
        };
      });
      
      console.log('TasksSelectionPage: отформатированные задания:', formattedTasks);
      setTasks(formattedTasks);
    } catch (err) {
      console.error('TasksSelectionPage: ошибка загрузки заданий:', err);
      setError('Не удалось загрузить задания: ' + (err.message || 'Неизвестная ошибка'));
    } finally {
      setLoading(false);
    }
  }, [user]);

  // Функция получения описания задания по типу
  const getTaskDescription = (taskType) => {
    const descriptions = {
      'Задание_4': 'Постановка ударения',
      'Задание_7': 'Морфологические нормы',
      'Задание_9': 'Правописание корней',
      'Задание_10': 'Правописание приставок',
      'Задание_11': 'Правописание суффиксов',
      'Задание_12': 'Правописание окончаний'
    };
    return descriptions[taskType] || taskType;
  };

  // Функция получения иконки задания по типу
  const getTaskIcon = (taskType) => {
    const icons = {
      'Задание_4': 'Á',
      'Задание_7': 'OB',
      'Задание_9': '~',
      'Задание_10': '[]',
      'Задание_11': '^',
      'Задание_12': '■'
    };
    return icons[taskType] || '?';
  };

  // Загружаем задания при изменении пользователя
  useEffect(() => {
    console.log('TasksSelectionPage: useEffect сработал', {
      user: user,
      isAuthenticated: isAuthenticated,
      authLoading: authLoading,
      userId: user?.user_id || user?.id
    });
    
    if (authLoading) {
      console.log('TasksSelectionPage: авторизация еще загружается, ждем...');
      return;
    }
    
    if (isAuthenticated && user) {
      console.log('TasksSelectionPage: начинаем загрузку заданий');
      loadTasks();
    } else if (!isAuthenticated) {
      console.log('TasksSelectionPage: пользователь не авторизован');
      setLoading(false);
      setError('Необходима авторизация. Перейдите на страницу входа.');
    } else {
      console.log('TasksSelectionPage: пользователь не готов');
      setLoading(false);
    }
  }, [isAuthenticated, user, authLoading, loadTasks]);

  // Показываем загрузку авторизации
  if (authLoading) {
    return (
      <div className="app-container">
        <div className="main-container">
          <div style={{ textAlign: 'center', padding: '50px' }}>
            <h2>Загрузка...</h2>
            <p>Проверка авторизации...</p>
          </div>
        </div>
      </div>
    );
  }

  // Показываем ошибку авторизации
  if (!isAuthenticated) {
    return (
      <div className="app-container">
        <div className="main-container">
          <div style={{ textAlign: 'center', padding: '50px' }}>
            <h2>Требуется авторизация</h2>
            <p>Для просмотра заданий необходимо войти в систему</p>
            <button 
              onClick={() => navigate('/login')}
              style={{ 
                padding: '12px 24px', 
                backgroundColor: '#007bff', 
                color: 'white', 
                border: 'none', 
                borderRadius: '8px',
                cursor: 'pointer',
                fontSize: '16px',
                marginTop: '20px'
              }}
            >
              Перейти к входу
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="app-container">
      <div className="main-container">
        {/* Header */}
        <header className="header">
          <div className="header-content">
            <div className="logo-container">
              <img className="logo-img" alt="Logo" src={x2} />
              <h1 className="logo-title">FOCUSY</h1>
            </div>

            <button className="profile-btn" onClick={handleProfileClick}>
              <div className="btn-content outlined">
                <img className="btn-icon" alt="Profile" src={frame56} />
                <span className="btn-text">{isAuthenticated ? (user?.name || 'Профиль') : 'Профиль'}</span>
              </div>
            </button>

            <div className="points-container">
              <div className="points-display">
                <img className="points-icon" alt="Coin" src={i2} />
                <span className="points-value">{user?.coins ?? 0}</span>
              </div>
            </div>
          </div>
        </header>

        {/* Tasks list section */}
        <section className="taskselect-section">
          <div className="taskselect-container">
            <h2 className="taskselect-title">ЗАДАНИЯ</h2>
            
            {/* Отладочная информация */}
            <div style={{ 
              background: '#f8f9fa', 
              padding: '10px', 
              margin: '10px 0', 
              borderRadius: '8px', 
              fontSize: '12px',
              color: '#666'
            }}>
              <strong>Отладка:</strong> Пользователь: {user?.name} (ID: {user?.user_id || user?.id}) | 
              Авторизован: {isAuthenticated ? 'Да' : 'Нет'} | 
              Заданий: {tasks.length}
            </div>

            {loading ? (
              <div className="taskselect-loading">Загрузка заданий...</div>
            ) : error ? (
              <div className="taskselect-error">
                <div>{error}</div>
                <button 
                  onClick={() => loadTasks()} 
                  style={{ 
                    marginTop: '10px', 
                    padding: '8px 16px', 
                    backgroundColor: '#007bff', 
                    color: 'white', 
                    border: 'none', 
                    borderRadius: '4px',
                    cursor: 'pointer'
                  }}
                >
                  Попробовать снова
                </button>
              </div>
            ) : tasks.length === 0 ? (
              <div className="taskselect-no-tasks">
                <div>Задания не найдены</div>
                <button 
                  onClick={() => loadTasks()} 
                  style={{ 
                    marginTop: '10px', 
                    padding: '8px 16px', 
                    backgroundColor: '#007bff', 
                    color: 'white', 
                    border: 'none', 
                    borderRadius: '4px',
                    cursor: 'pointer'
                  }}
                >
                  Обновить
                </button>
              </div>
            ) : (
              <div className="taskselect-list">
                {tasks.map((t) => (
                  <div key={t.id} className="taskselect-item" onClick={() => navigate(`/difficulty/${t.id}`)}>
                    <div className="taskselect-icon">
                      <TaskIcon folder={t.folder} fallbackText={t.iconText} />
                    </div>
                    <div className="taskselect-texts">
                      <div className="taskselect-task">{t.title}</div>
                      <div className="taskselect-sub">{t.subtitle}</div>
                      <div className="taskselect-stats">
                        {t.completed}/{t.total} выполнено • {t.correct} правильно
                      </div>
                    </div>
                    <div className="taskselect-progress" style={{ color: t.color }}>
                      {t.progress}%
                    </div>
                  </div>
                ))}
              </div>
            )}

            <p className="taskselect-footer">Скоро здесь появятся новые задания</p>
          </div>
        </section>

        {/* Back button below tasks */}
        <div className="taskselect-back" style={{ width: 360 }}>
          <button className="profile-btn difficulty-back-btn" onClick={() => navigate('/') }>
            <div className="btn-content outlined">
              <img className="btn-icon" alt="Back" src={arrow8} />
              <span className="btn-text">Назад</span>
            </div>
          </button>
        </div>

        {/* Bottom navigation */}
        <nav className="navigation">
          <div className="nav-container">
            {navigationItems.map((item) => (
              <div
                key={item.id}
                className={`nav-item ${item.id} ${item.isActive ? "active" : ""}`}
                onClick={() => handleNavClick(item.id)}
              >
                <img className="nav-icon" alt={item.iconAlt} src={item.icon} />
                <span className="label">{item.label}</span>
              </div>
            ))}
          </div>
        </nav>
      </div>
    </div>
  );
};

export default TasksSelectionPage;

