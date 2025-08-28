#!/usr/bin/env python3
"""
Тестовый скрипт для проверки функциональности FOCUSY Telegram бота
Запускается без Telegram API для тестирования логики
"""

import asyncio
import sys
import os
from unittest.mock import Mock, AsyncMock
from database import DatabaseManager
from config import BOT_SETTINGS

# Мокаем Telegram объекты
class MockUpdate:
    def __init__(self, user_id, first_name="Test", message_text=""):
        self.effective_user = Mock()
        self.effective_user.id = user_id
        self.effective_user.first_name = first_name
        
        self.message = Mock()
        self.message.text = message_text
        self.message.reply_text = AsyncMock()
        self.message.edit_message_text = AsyncMock()

class MockCallbackQuery:
    def __init__(self, data):
        self.data = data
        self.answer = AsyncMock()
        self.edit_message_text = AsyncMock()

class MockContext:
    def __init__(self):
        self.user_data = {}

async def test_database_connection():
    """Тест подключения к базе данных"""
    print("🧪 Тестирование подключения к базе данных...")
    
    try:
        db = DatabaseManager()
        if db.connection:
            print("✅ Подключение к базе данных успешно")
            
            # Тест получения количества пользователей
            total_users = db.get_total_users_count()
            print(f"📊 Всего пользователей в базе: {total_users}")
            
            db.close()
            return True
        else:
            print("❌ Не удалось подключиться к базе данных")
            return False
    except Exception as e:
        print(f"❌ Ошибка тестирования БД: {e}")
        return False

async def test_user_creation():
    """Тест создания пользователя"""
    print("\n🧪 Тестирование создания пользователя...")
    
    try:
        db = DatabaseManager()
        
        # Тестовые данные
        test_telegram_id = 999999999
        test_name = "ТестовыйПользователь"
        test_class = "11"
        
        # Проверяем, что пользователя нет
        if db.user_exists(test_telegram_id):
            print("⚠️ Тестовый пользователь уже существует, удаляем...")
            # Здесь можно добавить удаление тестового пользователя
        
        # Создаем пользователя
        user_data = db.create_user(
            telegram_id=test_telegram_id,
            name=test_name,
            user_class=test_class
        )
        
        if user_data:
            print(f"✅ Пользователь создан успешно:")
            print(f"   ID: {user_data['user_id']}")
            print(f"   Имя: {user_data['name']}")
            print(f"   Класс: {user_data['user_class']}")
            
            # Проверяем, что пользователь существует
            if db.user_exists(test_telegram_id):
                print("✅ Пользователь найден в базе")
                
                # Получаем данные пользователя
                retrieved_user = db.get_user_by_telegram_id(test_telegram_id)
                if retrieved_user:
                    print(f"✅ Данные пользователя получены: {retrieved_user['name']}")
                else:
                    print("❌ Не удалось получить данные пользователя")
            else:
                print("❌ Пользователь не найден после создания")
            
            # Получаем статистику
            stats = db.get_user_stats(user_data['user_id'])
            if stats:
                print(f"✅ Статистика получена: {stats['total_attempts']} попыток")
            else:
                print("⚠️ Статистика пуста (новый пользователь)")
            
        else:
            print("❌ Не удалось создать пользователя")
        
        db.close()
        return True
        
    except Exception as e:
        print(f"❌ Ошибка тестирования создания пользователя: {e}")
        return False

async def test_config():
    """Тест конфигурации"""
    print("\n🧪 Тестирование конфигурации...")
    
    try:
        from config import TELEGRAM_TOKEN, DB_CONFIG, BOT_SETTINGS
        
        print("✅ Конфигурация загружена:")
        print(f"   Telegram Token: {'Установлен' if TELEGRAM_TOKEN else 'Не установлен'}")
        print(f"   DB Host: {DB_CONFIG['host']}")
        print(f"   DB Port: {DB_CONFIG['port']}")
        print(f"   DB Name: {DB_CONFIG['dbname']}")
        print(f"   DB User: {DB_CONFIG['user']}")
        print(f"   Welcome Message: {len(BOT_SETTINGS['welcome_message'])} символов")
        
        return True
        
    except Exception as e:
        print(f"❌ Ошибка тестирования конфигурации: {e}")
        return False

async def test_schema_update():
    """Тест обновления схемы базы данных"""
    print("\n🧪 Тестирование схемы базы данных...")
    
    try:
        db = DatabaseManager()
        
        # Проверяем наличие поля telegram_id
        check_query = """
        SELECT column_name, data_type 
        FROM information_schema.columns 
        WHERE table_name = 'users' AND column_name = 'telegram_id'
        """
        
        result = db.execute_query(check_query, fetch_one=True)
        
        if result:
            print(f"✅ Поле telegram_id найдено: {result['data_type']}")
        else:
            print("❌ Поле telegram_id не найдено")
            print("💡 Выполните SQL скрипт update_schema.sql")
            print("   psql -h localhost -U temo4ka -d focusy_db -f update_schema.sql")
        
        db.close()
        return result is not None
        
    except Exception as e:
        print(f"❌ Ошибка тестирования схемы: {e}")
        return False

async def main():
    """Основная функция тестирования"""
    print("🚀 Запуск тестирования FOCUSY Telegram Bot\n")
    
    tests = [
        ("Конфигурация", test_config),
        ("Схема БД", test_schema_update),
        ("Подключение к БД", test_database_connection),
        ("Создание пользователя", test_user_creation),
    ]
    
    results = []
    
    for test_name, test_func in tests:
        try:
            result = await test_func()
            results.append((test_name, result))
        except Exception as e:
            print(f"❌ Критическая ошибка в тесте '{test_name}': {e}")
            results.append((test_name, False))
    
    # Выводим итоги
    print("\n" + "="*50)
    print("📊 РЕЗУЛЬТАТЫ ТЕСТИРОВАНИЯ")
    print("="*50)
    
    passed = 0
    total = len(results)
    
    for test_name, result in results:
        status = "✅ ПРОЙДЕН" if result else "❌ ПРОВАЛЕН"
        print(f"{test_name:20} | {status}")
        if result:
            passed += 1
    
    print("="*50)
    print(f"Итого: {passed}/{total} тестов пройдено")
    
    if passed == total:
        print("🎉 Все тесты пройдены! Бот готов к запуску.")
        print("\n🚀 Для запуска бота выполните:")
        print("   python bot.py")
    else:
        print("⚠️ Некоторые тесты не пройдены. Проверьте настройки.")
        print("\n🔧 Рекомендации:")
        print("   1. Проверьте файл .env")
        print("   2. Убедитесь, что PostgreSQL запущен")
        print("   3. Выполните update_schema.sql")
        print("   4. Проверьте права доступа к базе данных")

if __name__ == "__main__":
    asyncio.run(main())
