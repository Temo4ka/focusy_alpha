#!/bin/bash
# start_all_system.sh

echo "====================================================="
echo "          ЗАПУСК ПОЛНОЙ СИСТЕМЫ FOCUSY"
echo "====================================================="
echo ""
echo "🚀 Запускаются все компоненты:"
echo "  📊 Django Админ панель (порт 8001)"
echo "  🔧 Node.js API бэкенд (порт 3001)"  
echo "  🌐 React фронтенд (порт 3000)"
echo ""

# Проверяем Node.js
if ! command -v node &> /dev/null; then
    echo "❌ Ошибка: Node.js не найден"
    echo "   Установите Node.js с https://nodejs.org/"
    read -p "Нажмите Enter для выхода..."
    exit 1
fi

# Проверяем Python
if ! command -v python3 &> /dev/null; then
    echo "❌ Ошибка: Python не найден"
    echo "   Установите Python с https://python.org/"
    read -p "Нажмите Enter для выхода..."
    exit 1
fi

echo "✅ Node.js и Python найдены"
echo ""

# 1. Запуск Django админ панели
echo "📊 Запуск Django админ панели..."
cd admin_panel
if [ ! -d "venv" ]; then
    echo "❌ Виртуальное окружение Django не найдено"
    echo "   Запустите admin_panel/setup.sh"
    read -p "Нажмите Enter для выхода..."
    exit 1
fi

# Запуск Django в новом терминальном окне
osascript -e 'tell app "Terminal" to do script "cd '"$(pwd)"' && source venv/bin/activate && python manage.py runserver 8001"'
cd ..

# Ждем 3 секунды
sleep 3

# 2. Запуск Node.js бэкенда
echo "🔧 Запуск Node.js API бэкенда..."
cd backend
if [ ! -d "node_modules" ]; then
    echo "📦 Установка зависимостей Node.js..."
    npm install
fi

# Запуск Node.js в новом терминальном окне
osascript -e 'tell app "Terminal" to do script "cd '"$(pwd)"' && npm start"'
cd ..

# Ждем 3 секунды
sleep 3

# 3. Запуск React фронтенда
echo "🌐 Запуск React фронтенда..."
cd frontend
if [ ! -d "node_modules" ]; then
    echo "📦 Установка зависимостей React..."
    npm install
fi

# Запуск React в новом терминальном окне
osascript -e 'tell app "Terminal" to do script "cd '"$(pwd)"' && npm start"'
cd ..

echo ""
echo "====================================================="
echo "🎉 ВСЕ КОМПОНЕНТЫ ЗАПУЩЕНЫ!"
echo ""
echo "🌐 Откройте в браузере:"
echo "  📊 Админ панель:  http://localhost:8001/admin/"
echo "  🔧 API бэкенд:    http://localhost:3001/"
echo "  🌐 Фронтенд:      http://localhost:3000/"
echo "  🧪 Тест связи:    http://localhost:3000/test-integration"
echo ""
echo "💡 Для тестирования интеграции:"
echo "   Откройте http://localhost:3000/test-integration"
echo ""
echo "🛑 Для остановки всех сервисов:"
echo "   Закройте все открытые окна терминала"
echo "====================================================="

# Ждем 5 секунд и открываем браузер
sleep 5
open http://localhost:3000/test-integration

read -p "Нажмите Enter для завершения..."