@echo off
echo =====================================================
echo          ЗАПУСК ПОЛНОЙ СИСТЕМЫ FOCUSY
echo =====================================================
echo.
echo 🚀 Запускаются все компоненты:
echo   📊 Django Админ панель (порт 8001)
echo   🔧 Node.js API бэкенд (порт 3001)  
echo   🌐 React фронтенд (порт 3000)
echo.

REM Проверяем Node.js
node --version >nul 2>&1
if errorlevel 1 (
    echo ❌ Ошибка: Node.js не найден
    echo    Установите Node.js с https://nodejs.org/
    pause
    exit /b 1
)

REM Проверяем Python
py --version >nul 2>&1
if errorlevel 1 (
    echo ❌ Ошибка: Python не найден
    echo    Установите Python с https://python.org/
    pause
    exit /b 1
)

echo ✅ Node.js и Python найдены
echo.

REM 1. Запуск Django админ панели
echo 📊 Запуск Django админ панели...
cd admin_panel
if not exist "venv\Scripts\activate.bat" (
    echo ❌ Виртуальное окружение Django не найдено
    echo    Запустите admin_panel\setup.bat
    pause
    exit /b 1
)
start "Django Admin Panel" cmd /k "venv\Scripts\activate.bat && python manage.py runserver 8001"
cd ..

REM Ждем 3 секунды
timeout /t 3 /nobreak >nul

REM 2. Запуск Node.js бэкенда
echo 🔧 Запуск Node.js API бэкенда...
cd backend
if not exist "node_modules" (
    echo 📦 Установка зависимостей Node.js...
    npm install
)
start "Node.js Backend API" cmd /k "npm start"
cd ..

REM Ждем 3 секунды
timeout /t 3 /nobreak >nul

REM 3. Запуск React фронтенда
echo 🌐 Запуск React фронтенда...
cd frontend
if not exist "node_modules" (
    echo 📦 Установка зависимостей React...
    npm install
)
start "React Frontend" cmd /k "npm start"
cd ..

echo.
echo =====================================================
echo 🎉 ВСЕ КОМПОНЕНТЫ ЗАПУЩЕНЫ!
echo.
echo 🌐 Откройте в браузере:
echo   📊 Админ панель:  http://localhost:8001/admin/
echo   🔧 API бэкенд:    http://localhost:3001/
echo   🌐 Фронтенд:      http://localhost:3000/
echo   🧪 Тест связи:    http://localhost:3000/test-integration
echo.
echo 💡 Для тестирования интеграции:
echo    Откройте http://localhost:3000/test-integration
echo.
echo 🛑 Для остановки всех сервисов:
echo    Закройте все открытые окна терминала
echo =====================================================

REM Ждем 5 секунд и открываем браузер
timeout /t 5 /nobreak >nul
start http://localhost:3000/test-integration

pause
