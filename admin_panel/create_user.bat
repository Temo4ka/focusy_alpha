@echo off
echo =====================================================
echo      Создание нового администратора FOCUSY
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

echo Создание нового администратора...
echo.

REM Запускаем команду создания суперпользователя
python manage.py createsuperuser

echo.
echo Администратор создан! Теперь можете войти в админ панель:
echo   http://localhost:8001/admin/
echo.
pause
