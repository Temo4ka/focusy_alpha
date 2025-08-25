@echo off
echo =====================================================
echo          FOCUSY Admin Panel Server
echo =====================================================
echo.

REM Проверяем наличие виртуального окружения
if not exist "venv\Scripts\activate.bat" (
    echo Ошибка: Виртуальное окружение не найдено.
    echo Сначала запустите setup.bat
    pause
    exit /b 1
)

REM Активируем виртуальное окружение
call venv\Scripts\activate.bat

REM Проверяем наличие .env файла
if not exist ".env" (
    echo Ошибка: Файл .env не найден.
    echo Сначала запустите setup.bat
    pause
    exit /b 1
)

echo Запуск Django сервера...
echo.
echo Админ панель будет доступна по адресу:
echo   http://localhost:8001/admin/
echo.
echo Аналитика доступна по адресу:
echo   http://localhost:8001/analytics/
echo.
echo Для остановки сервера нажмите Ctrl+C
echo.

REM Запускаем Django сервер
python manage.py runserver 8001

echo.
echo Сервер остановлен.
pause
