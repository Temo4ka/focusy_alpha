#!/bin/bash
# start_all.sh

echo "====================================================="
echo "           FOCUSY - Полный запуск системы"
echo "====================================================="
echo ""

echo "Запуск всех компонентов системы..."
echo ""

# Проверяем наличие Node.js
if ! command -v node &> /dev/null; then
    echo "Ошибка: Node.js не найден. Установите Node.js с официального сайта."
    read -p "Нажмите Enter для выхода..."
    exit 1
fi

echo "1. Установка зависимостей бэкенда..."
cd backend
if [ ! -d "node_modules" ]; then
    echo "Установка npm пакетов для бэкенда..."
    npm install
fi

echo ""
echo "2. Копирование .env файла для бэкенда..."
if [ ! -f ".env" ]; then
    cp env_example.txt .env
    echo ".env файл создан из примера"
fi

echo ""
echo "3. Запуск API сервера (порт 3001)..."
osascript -e 'tell app "Terminal" to do script "cd '"$(pwd)"' && npm start"'

cd ../frontend
echo ""
echo "4. Установка зависимостей фронтенда..."
if [ ! -d "node_modules" ]; then
    echo "Установка npm пакетов для фронтенда..."
    npm install
fi

echo ""
echo "5. Запуск React приложения (порт 3000)..."
osascript -e 'tell app "Terminal" to do script "cd '"$(pwd)"' && npm start"'

cd ../admin_panel
echo ""
echo "6. Запуск Django админ панели (порт 8001)..."
if [ -d "venv" ]; then
    osascript -e 'tell app "Terminal" to do script "cd '"$(pwd)"' && source venv/bin/activate && python manage.py runserver 8001"'
else
    echo "Админ панель не настроена. Запустите admin_panel/setup.sh"
fi

cd ..
echo ""
echo "====================================================="
echo "🎉 Все компоненты запущены!"
echo ""
echo "📱 Фронтенд:      http://localhost:3000"
echo "🔧 API сервер:    http://localhost:3001"  
echo "📊 Админ панель:  http://localhost:8001/admin/"
echo ""
echo "Для остановки закройте все окна терминалов"
echo "====================================================="
read -p "Нажмите Enter для завершения..."