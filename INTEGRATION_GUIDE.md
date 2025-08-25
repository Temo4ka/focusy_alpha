# 🔗 Руководство по интеграции FOCUSY

## 🎯 Обзор архитектуры

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   React App     │    │   Node.js API   │    │ Django Admin    │
│   (Frontend)    │◄──►│   (Backend)     │◄──►│   (Content)     │
│   Port: 3000    │    │   Port: 3001    │    │   Port: 8001    │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         └───────────────────────┼───────────────────────┘
                                 ▼
                        ┌─────────────────┐
                        │   SQLite DB     │
                        │   (Shared)      │
                        └─────────────────┘
```

## 🚀 Быстрый старт

### Автоматический запуск всей системы:
```bash
start_all.bat
```

### Ручной запуск по компонентам:

1. **API сервер:**
   ```bash
   cd backend
   npm install
   npm start
   ```

2. **React фронтенд:**
   ```bash
   cd frontend  
   npm install
   npm start
   ```

3. **Django админка:**
   ```bash
   cd admin_panel
   setup.bat  # Первый раз
   start_admin.bat
   ```

## 📡 API Endpoints

### Пользователи (`/api/users`)
- `POST /register` - Регистрация
- `POST /login` - Вход
- `GET /:id` - Получение данных пользователя

### Задания (`/api/tasks`)
- `GET /` - Список заданий (фильтры: difficulty, subject, limit)
- `GET /:id` - Конкретное задание
- `POST /:id/attempt` - Отправка ответа
- `GET /user/:user_id/stats` - Статистика пользователя

### Миссии (`/api/missions`)
- `GET /` - Все активные миссии
- `GET /user/:user_id` - Миссии пользователя с прогрессом
- `POST /:mission_id/start` - Начать миссию
- `POST /:mission_id/complete` - Завершить миссию
- `GET /stats` - Статистика миссий

## 🔐 Аутентификация

### JWT токены
- Токен сохраняется в `localStorage`
- Автоматически добавляется к запросам
- Время жизни: 1 час

### Использование в React:
```javascript
import { useAuth } from './contexts/AuthContext';

function MyComponent() {
  const { user, login, logout, isAuthenticated } = useAuth();
  
  // Вход
  const handleLogin = async () => {
    const result = await login({ email, password });
    if (result.success) {
      console.log('Вход выполнен:', result.user);
    }
  };
}
```

## 📊 Управление состоянием

### AuthContext
- Глобальное состояние пользователя
- Автоматическое обновление статистики
- Проверка аутентификации

### Хуки для данных
```javascript
import { useTasks } from './hooks/useTasks';
import { useMissions } from './hooks/useMissions';

// Задания
const { tasks, loadTasks, submitAnswer } = useTasks();

// Миссии  
const { userMissions, startMission, completeMission } = useMissions();
```

## 🎮 Игровая механика

### Система опыта
- **Легкие задания:** 50 XP
- **Средние задания:** 100 XP  
- **Сложные задания:** 150 XP
- **Уровень:** XP ÷ 1000 + 1

### Система монет
- **Легкие задания:** 10 монет
- **Средние задания:** 20 монет
- **Сложные задания:** 30 монет
- **Миссии:** по настройке в админке

### Миссии
- Требуют выполнения определенного количества заданий
- Дают бонусные награды за завершение
- Отслеживают прогресс автоматически

## 🔄 Синхронизация данных

### Автоматическое обновление
- Статистика пользователя обновляется после каждого задания
- Прогресс миссий отслеживается в реальном времени
- Данные кэшируются в localStorage

### Обработка ошибок
- Автоматический retry для сетевых ошибок
- Graceful degradation при недоступности API
- Показ понятных сообщений об ошибках

## 🎨 Кастомизация UI

### Интеграция с существующим дизайном
Компоненты используют существующие CSS классы:

```javascript
// Пример компонента задания
function TaskCard({ task }) {
  return (
    <div className="subject-card">
      <h3 className="subject-name">{task.type}</h3>
      <p className="subject-description">{task.content}</p>
    </div>
  );
}
```

### Показ статистики
```javascript
function UserStats() {
  const { user } = useAuth();
  
  return (
    <div className="points-container">
      <span className="points-value">{user?.experience || 0} XP</span>
      <span className="points-value">{user?.coins || 0} 💰</span>
      <span className="level-text">Уровень {user?.level || 1}</span>
    </div>
  );
}
```

## 📱 Интеграция с существующими страницами

### Главная страница (mainpage.jsx)
```javascript
import { useAuth } from './contexts/AuthContext';

export const IphoneProMax = () => {
  const { user, isAuthenticated } = useAuth();
  
  // Заменить захардкоженные значения
  const points = user?.coins || 1200;
  const experience = user?.experience || 750;
  const level = user?.level || 1;
  
  // Остальной код...
}
```

### Страница заданий (TasksSelectionPage.jsx)
```javascript
import { useTasks } from './hooks/useTasks';

export const TasksSelectionPage = () => {
  const { tasks, loadTasks, isLoading } = useTasks();
  
  useEffect(() => {
    loadTasks({ subject: 'russian', limit: 10 });
  }, []);
  
  // Отображение реальных заданий вместо mock данных
}
```

### Профиль пользователя (ProfilePage.jsx)
```javascript
import { useAuth } from './contexts/AuthContext';
import { useTasks } from './hooks/useTasks';

export const ProfilePage = () => {
  const { user, refreshUser } = useAuth();
  const { loadUserStats } = useTasks();
  
  // Показ реальной статистики пользователя
}
```

## 🛠️ Разработка и отладка

### Переменные окружения
Создайте `.env` файлы:

**Frontend (.env):**
```env
REACT_APP_API_URL=http://localhost:3001/api
```

**Backend (.env):**
```env
PORT=3001
JWT_SECRET=your-secret-key
DB_NAME=focusy_db
```

### Отладка API
```javascript
// Проверка состояния API
import { apiUtils } from './services/api';

const checkAPI = async () => {
  const health = await apiUtils.checkHealth();
  console.log('API состояние:', health);
};
```

### Логирование
```javascript
// Включить подробные логи
localStorage.setItem('debug', 'true');
```

## 🔒 Безопасность

### Валидация данных
- Все входные данные валидируются на сервере
- XSS защита через React
- CORS настроен только для разрешенных доменов

### Хранение токенов
- JWT токены в localStorage (для простоты)
- В продакшене рассмотрите httpOnly cookies

## 📈 Производительность

### Оптимизация запросов
- Кэширование в localStorage
- Debounce для поисковых запросов
- Lazy loading компонентов

### Мониторинг
- Error boundaries в React
- Логирование ошибок API
- Метрики производительности

## 🚀 Деплой

### Продакшен
1. **Фронтенд:** `npm run build` → статические файлы
2. **API:** PM2 или Docker для Node.js сервера
3. **Админка:** Gunicorn + Nginx для Django
4. **База данных:** PostgreSQL вместо SQLite

### Переменные окружения для продакшена
```env
NODE_ENV=production
JWT_SECRET=secure-random-string
DB_HOST=production-db-host
CORS_ORIGIN=https://your-domain.com
```

## 🎯 Следующие шаги

1. **Тестирование интеграции** - проверьте все компоненты
2. **Добавление новых заданий** - через Django админку
3. **Кастомизация UI** - адаптация под дизайн
4. **Настройка PostgreSQL** - для продакшена
5. **Добавление новых фич** - уведомления, достижения и т.д.

## 📞 Поддержка

При возникновении проблем:
1. Проверьте консоль браузера (F12)
2. Проверьте логи API сервера
3. Убедитесь что все порты свободны (3000, 3001, 8001)
4. Перезапустите все сервисы
