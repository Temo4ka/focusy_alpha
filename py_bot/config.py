import os
from dotenv import load_dotenv

# Загружаем переменные окружения
load_dotenv()

# Настройки Telegram бота
TELEGRAM_TOKEN = os.getenv('TELEGRAM_TOKEN', '')
BOT_USERNAME = os.getenv('BOT_USERNAME', '')

# Настройки базы данных PostgreSQL
DB_CONFIG = {
    'host': os.getenv('DB_HOST', 'localhost'),
    'port': os.getenv('DB_PORT', '5432'),
    'dbname': os.getenv('DB_NAME', 'focusy_db'),
    'user': os.getenv('DB_USER', 'temo4ka'),
    'password': os.getenv('DB_PASSWORD', ''),
}

# Настройки API сайта
SITE_API_URL = os.getenv('SITE_API_URL', 'http://localhost:3001/api')

# Настройки бота
BOT_SETTINGS = {
    'max_users': 1000,  # Максимальное количество пользователей
    'welcome_message': """
🎓 Добро пожаловать в FOCUSY!

Это бот для подготовки к ЕГЭ и ОГЭ по русскому языку.

📚 Что вы получите:
• Доступ к 200+ заданиям
• Персональную статистику
• Прогресс обучения
• Систему достижений

🚀 Начните обучение прямо сейчас!
    """,
    'help_message': """
🤖 Команды бота:

/start - Начать работу с ботом
/register - Зарегистрироваться на сайте
/help - Показать эту справку
/profile - Ваш профиль
/status - Статус регистрации

💡 Для регистрации используйте команду /register
    """
}
