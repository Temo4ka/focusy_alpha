@echo off
echo =====================================================
echo           FOCUSY - Полный запуск системы
echo =====================================================
echo.

echo Запуск всех компонентов системы...
echo.

REM Проверяем наличие Node.js
node --version >nul 2>&1
if errorlevel 1 (
    echo Ошибка: Node.js не найден. Установите Node.js с официального сайта.
    pause
    exit /b 1
)

echo 1. Установка зависимостей бэкенда...
cd backend
if not exist "node_modules" (
    echo Установка npm пакетов для бэкенда...
    call npm install
)

echo.
echo 2. Копирование .env файла для бэкенда...
if not exist ".env" (
    copy env_example.txt .env
    echo .env файл создан из примера
)

echo.
echo 3. Запуск API сервера (порт 3001)...
start "FOCUSY API Server" cmd /k "npm start"

cd ..\frontend
echo.
echo 4. Установка зависимостей фронтенда...
if not exist "node_modules" (
    echo Установка npm пакетов для фронтенда...
    call npm install
)

echo.
echo 5. Запуск React приложения (порт 3000)...
start "FOCUSY Frontend" cmd /k "npm start"

cd ..\admin_panel
echo.
echo 6. Запуск Django админ панели (порт 8001)...
if exist "venv\Scripts\activate.bat" (
    start "FOCUSY Admin Panel" cmd /k "venv\Scripts\activate && python manage.py runserver 8001"
) else (
    echo Админ панель не настроена. Запустите admin_panel\setup.bat
)

cd ..
echo.
echo =====================================================
echo 🎉 Все компоненты запущены!
echo.
echo 📱 Фронтенд:      http://localhost:3000
echo 🔧 API сервер:    http://localhost:3001  
echo 📊 Админ панель:  http://localhost:8001/admin/
echo.
echo Для остановки закройте все окна терминалов
echo =====================================================
pause
