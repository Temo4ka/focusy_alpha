import psycopg
from psycopg.rows import dict_row
from config import DB_CONFIG
import logging

# Настройка логирования
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class DatabaseManager:
    def __init__(self):
        self.connection = None
        self.connect()
    
    def connect(self):
        """Подключение к базе данных"""
        try:
            self.connection = psycopg.connect(**DB_CONFIG, row_factory=dict_row)
            logger.info("✅ Подключение к базе данных установлено")
        except Exception as e:
            logger.error(f"❌ Ошибка подключения к базе данных: {e}")
            self.connection = None
    
    def reconnect(self):
        """Переподключение к базе данных"""
        if self.connection:
            self.connection.close()
        self.connect()
    
    def execute_query(self, query, params=None, fetch_one=False, fetch_all=False):
        """Выполнение SQL запроса"""
        if not self.connection:
            self.reconnect()
            if not self.connection:
                return None
        
        try:
            with self.connection.cursor() as cursor:
                cursor.execute(query, params)
                
                if fetch_one:
                    result = cursor.fetchone()
                elif fetch_all:
                    result = cursor.fetchall()
                else:
                    result = None
                
                self.connection.commit()
                return result
                
        except Exception as e:
            logger.error(f"❌ Ошибка выполнения запроса: {e}")
            self.connection.rollback()
            return None
    
    def user_exists(self, telegram_id):
        """Проверка существования пользователя по Telegram ID"""
        query = "SELECT user_id, name FROM users WHERE telegram_id = %s"
        result = self.execute_query(query, (telegram_id,), fetch_one=True)
        return result is not None
    
    def get_user_by_telegram_id(self, telegram_id):
        """Получение пользователя по Telegram ID"""
        query = """
        SELECT user_id, name, user_class, experience_points, coins, subscribe, created_at
        FROM users 
        WHERE telegram_id = %s
        """
        return self.execute_query(query, (telegram_id,), fetch_one=True)
    
    def create_user(self, telegram_id, name, user_class="4", consent_given=True):
        """Создание нового пользователя"""
        try:
            # Генерируем уникальный user_id
            user_id_query = "SELECT COALESCE(MAX(user_id), 1000) + 1 as next_id FROM users"
            user_id_result = self.execute_query(user_id_query, fetch_one=True)
            user_id = user_id_result['next_id'] if user_id_result else 1001
            
            # Создаем пользователя
            insert_query = """
            INSERT INTO users (user_id, telegram_id, name, user_class, consent_given, experience_points, coins, subscribe, created_at)
            VALUES (%s, %s, %s, %s, %s, %s, %s, %s, NOW())
            RETURNING user_id, name, user_class, experience_points, coins
            """
            
            result = self.execute_query(
                insert_query, 
                (user_id, telegram_id, name, user_class, consent_given, 0, 0, False),
                fetch_one=True
            )
            
            if result:
                logger.info(f"✅ Пользователь создан: {result['name']} (ID: {result['user_id']})")
                return result
            else:
                logger.error("❌ Не удалось создать пользователя")
                return None
                
        except Exception as e:
            logger.error(f"❌ Ошибка создания пользователя: {e}")
            return None
    
    def update_user_telegram_id(self, user_id, telegram_id):
        """Обновление Telegram ID для существующего пользователя"""
        query = "UPDATE users SET telegram_id = %s WHERE user_id = %s"
        result = self.execute_query(query, (telegram_id, user_id))
        return result is not None
    
    def get_user_stats(self, user_id):
        """Получение статистики пользователя"""
        query = """
        SELECT 
            u.user_id,
            u.name,
            u.experience_points,
            u.coins,
            COUNT(uta.attempt_id) as total_attempts,
            COUNT(CASE WHEN uta.is_correct THEN 1 END) as correct_attempts
        FROM users u
        LEFT JOIN user_task_attempts uta ON u.user_id = uta.user_id
        WHERE u.user_id = %s
        GROUP BY u.user_id, u.name, u.experience_points, u.coins
        """
        return self.execute_query(query, (user_id,), fetch_one=True)
    
    def get_total_users_count(self):
        """Получение общего количества пользователей"""
        query = "SELECT COUNT(*) as total FROM users"
        result = self.execute_query(query, fetch_one=True)
        return result['total'] if result else 0
    
    def close(self):
        """Закрытие соединения с базой данных"""
        if self.connection:
            self.connection.close()
            logger.info("🔌 Соединение с базой данных закрыто")

# Создаем глобальный экземпляр менеджера базы данных
db_manager = DatabaseManager()
