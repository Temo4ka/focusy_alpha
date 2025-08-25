@echo off
echo =====================================================
echo      Загрузка демонстрационных данных FOCUSY
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

echo Загрузка демонстрационных данных...
echo Это займет несколько секунд...
echo.

REM Запускаем скрипт загрузки демо данных
python load_demo_data.py

echo.
echo Демо данные загружены! Теперь можете:
echo 1. Запустить админ панель: start_admin.bat
echo 2. Открыть http://localhost:8001/admin/
echo 3. Посмотреть аналитику: http://localhost:8001/analytics/
echo.
pause
