#!/usr/bin/env python3
"""
Скрипт автоматической настройки Django админ панели для FOCUSY
"""

import os
import sys
import subprocess
from pathlib import Path

def create_env_file():
    """Создает .env файл с настройками"""
    env_content = """# Django settings
DJANGO_SECRET_KEY=django-insecure-focusy-admin-panel-secret-key-change-in-production
DEBUG=True

# Database settings - используем ту же БД что и Node.js API
DB_NAME=focusy_db
DB_USER=postgres
DB_PASSWORD=password
DB_HOST=localhost
DB_PORT=5432
"""
    
    env_path = Path('.env')
    if env_path.exists():
        print("⚠️  Файл .env уже существует. Хотите перезаписать? (y/n): ", end="")
        if input().lower() != 'y':
            return
    
    with open(env_path, 'w', encoding='utf-8') as f:
        f.write(env_content)
    print("✅ Файл .env создан")

def install_dependencies():
    """Устанавливает зависимости Python"""
    print("📦 Установка зависимостей...")
    try:
        subprocess.run([sys.executable, '-m', 'pip', 'install', '-r', 'requirements.txt'], 
                      check=True, capture_output=True, text=True)
        print("✅ Зависимости установлены")
    except subprocess.CalledProcessError as e:
        print(f"❌ Ошибка установки зависимостей: {e}")
        print("Вывод:", e.stdout)
        print("Ошибки:", e.stderr)
        return False
    return True

def run_migrations():
    """Применяет миграции Django"""
    print("🔄 Создание и применение миграций...")
    try:
        # Создание миграций
        subprocess.run([sys.executable, 'manage.py', 'makemigrations'], 
                      check=True, capture_output=True, text=True)
        print("✅ Миграции созданы")
        
        # Применение миграций
        subprocess.run([sys.executable, 'manage.py', 'migrate'], 
                      check=True, capture_output=True, text=True)
        print("✅ Миграции применены")
    except subprocess.CalledProcessError as e:
        print(f"❌ Ошибка миграций: {e}")
        print("Вывод:", e.stdout)
        print("Ошибки:", e.stderr)
        return False
    return True

def create_superuser():
    """Создает суперпользователя для админки"""
    print("\n👤 Создание администратора")
    print("Введите данные для входа в админ панель:")
    
    username = input("Логин администратора: ").strip()
    if not username:
        username = "admin"
        print(f"Использую логин по умолчанию: {username}")
    
    email = input("Email администратора: ").strip()
    if not email:
        email = "admin@focusy.local"
        print(f"Использую email по умолчанию: {email}")
    
    # Создаем суперпользователя программно
    from django.core.management import execute_from_command_line
    os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
    
    import django
    django.setup()
    
    from django.contrib.auth.models import User
    
    if User.objects.filter(username=username).exists():
        print(f"⚠️  Пользователь {username} уже существует")
        return username
    
    password = input("Пароль администратора: ").strip()
    if not password:
        password = "admin123"
        print("⚠️  Используется пароль по умолчанию: admin123")
    
    User.objects.create_superuser(username=username, email=email, password=password)
    print(f"✅ Администратор {username} создан")
    return username

def main():
    """Основная функция настройки"""
    print("🚀 Настройка Django админ панели FOCUSY")
    print("=" * 50)
    
    # Проверяем что мы в правильной директории
    if not Path('manage.py').exists():
        print("❌ Ошибка: manage.py не найден. Запустите скрипт из папки admin_panel/")
        sys.exit(1)
    
    # Шаг 1: Создание .env файла
    print("\n1️⃣ Создание файла конфигурации...")
    create_env_file()
    
    # Шаг 2: Установка зависимостей
    print("\n2️⃣ Установка зависимостей...")
    if not install_dependencies():
        sys.exit(1)
    
    # Шаг 3: Применение миграций
    print("\n3️⃣ Настройка базы данных...")
    if not run_migrations():
        print("❌ Проверьте настройки подключения к PostgreSQL в .env файле")
        sys.exit(1)
    
    # Шаг 4: Создание администратора
    print("\n4️⃣ Создание администратора...")
    try:
        admin_username = create_superuser()
    except Exception as e:
        print(f"❌ Ошибка создания администратора: {e}")
        sys.exit(1)
    
    # Финальные инструкции
    print("\n" + "=" * 50)
    print("🎉 Настройка завершена!")
    print("\n📋 Для запуска админ панели:")
    print("   python manage.py runserver 8001")
    print("\n🌐 Админ панель будет доступна по адресу:")
    print("   http://localhost:8001/admin/")
    print("\n🔑 Данные для входа:")
    print(f"   Логин: {admin_username}")
    print("   Пароль: (который вы ввели)")
    print("\n📊 Аналитика доступна по адресу:")
    print("   http://localhost:8001/analytics/")

if __name__ == '__main__':
    main()
