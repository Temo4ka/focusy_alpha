# 🚀 Пошаговая инструкция по интеграции Django админ панели

## 📋 Требования

### Обязательные требования:
- **Python 3.8+** - [скачать с официального сайта](https://www.python.org/downloads/)
- **PostgreSQL** - должен быть уже установлен для Node.js проекта
- **Git** - для клонирования проекта

### Проверка Python:
```bash
python --version
# Должно показать Python 3.8.0 или выше
```

## 🎯 Автоматическая установка (рекомендуется)

### Для Windows:

1. **Откройте командную строку** в папке `admin_panel/`
2. **Запустите автоматическую установку:**
   ```bash
   setup.bat
   ```
3. **Следуйте инструкциям** в консоли для создания администратора
4. **Запустите админ панель:**
   ```bash
   start_admin.bat
   ```

### Для Linux/Mac:

1. **Перейдите в папку админки:**
   ```bash
   cd admin_panel
   ```
2. **Запустите автоматическую установку:**
   ```bash
   python3 setup_admin.py
   ```
3. **Запустите сервер:**
   ```bash
   python manage.py runserver 8001
   ```

## 🛠️ Ручная установка (если автоматическая не сработала)

### 1. Создание виртуального окружения

```bash
cd admin_panel
python -m venv venv

# Активация для Windows:
venv\Scripts\activate

# Активация для Linux/Mac:
source venv/bin/activate
```

### 2. Установка зависимостей

```bash
pip install -r requirements.txt
```

### 3. Настройка подключения к базе данных

Создайте файл `.env` в папке `admin_panel/`:

```env
# Django settings
DJANGO_SECRET_KEY=django-insecure-focusy-admin-panel-secret-key-change-in-production
DEBUG=True

# Database settings - ВАЖНО: используйте те же данные что и в Node.js проекте
DB_NAME=focusy_db
DB_USER=postgres
DB_PASSWORD=ваш_пароль_от_postgres
DB_HOST=localhost
DB_PORT=5432
```

**❗ ВАЖНО:** Параметры БД должны совпадать с теми, что используются в вашем Node.js проекте!

### 4. Применение миграций

```bash
python manage.py makemigrations
python manage.py migrate
```

### 5. Создание администратора

```bash
python manage.py createsuperuser
```

Введите данные для входа:
- **Логин:** например `admin`
- **Email:** например `admin@focusy.local`
- **Пароль:** придумайте надежный пароль

### 6. Запуск сервера

```bash
python manage.py runserver 8001
```

## 🌐 Доступ к админ панели

После запуска сервера админ панель будет доступна по адресам:

- **Админ панель:** http://localhost:8001/admin/
- **Аналитика:** http://localhost:8001/analytics/

## 🔑 Управление пользователями

### Создание дополнительных администраторов:

**Способ 1 - через bat файл (Windows):**
```bash
create_user.bat
```

**Способ 2 - через командную строку:**
```bash
# Активируйте виртуальное окружение
venv\Scripts\activate  # Windows
source venv/bin/activate  # Linux/Mac

# Создайте пользователя
python manage.py createsuperuser
```

### Изменение пароля существующего пользователя:

```bash
python manage.py changepassword имя_пользователя
```

## 🔧 Настройка интеграции с Node.js проектом

### 1. Проверка совместимости БД

Убедитесь что:
- PostgreSQL запущен
- База данных `focusy_db` существует
- Параметры подключения в `.env` совпадают с Node.js проектом

### 2. Проверка таблиц

Django автоматически создаст нужные таблицы при первом запуске миграций. Существующие данные сохранятся.

### 3. Синхронизация данных

Если у вас уже есть данные в БД от Node.js проекта:
- Django покажет их в админ панели
- Вы сможете редактировать их через интерфейс
- Изменения будут видны в Node.js приложении

## 🚨 Устранение проблем

### Ошибка подключения к базе данных:

1. **Проверьте что PostgreSQL запущен:**
   ```bash
   # Windows (через Service Manager)
   services.msc
   
   # Linux
   sudo systemctl status postgresql
   
   # Mac
   brew services list | grep postgresql
   ```

2. **Проверьте параметры в .env файле:**
   - Убедитесь что пароль указан правильно
   - Проверьте название базы данных
   - Убедитесь что порт правильный (обычно 5432)

3. **Создайте базу данных если её нет:**
   ```sql
   -- Подключитесь к PostgreSQL и выполните:
   CREATE DATABASE focusy_db;
   ```

### Python не найден:

1. **Скачайте Python** с https://www.python.org/downloads/
2. **При установке отметьте** "Add Python to PATH"
3. **Перезапустите** командную строку

### Ошибки при установке зависимостей:

1. **Обновите pip:**
   ```bash
   python -m pip install --upgrade pip
   ```

2. **Установите зависимости по одной:**
   ```bash
   pip install Django==4.2.7
   pip install psycopg2-binary==2.9.9
   # и так далее...
   ```

### Ошибка миграций:

1. **Сбросьте миграции:**
   ```bash
   python manage.py migrate --fake-initial
   ```

2. **Или пересоздайте миграции:**
   ```bash
   rm -rf content_management/migrations/
   python manage.py makemigrations content_management
   python manage.py migrate
   ```

## 🎯 Полезные команды

### Резервное копирование данных:
```bash
python manage.py dumpdata > backup.json
```

### Восстановление данных:
```bash
python manage.py loaddata backup.json
```

### Сбор статических файлов (для продакшена):
```bash
python manage.py collectstatic
```

### Просмотр SQL команд:
```bash
python manage.py sqlmigrate content_management 0001
```

## 📞 Поддержка

Если возникли проблемы:

1. **Проверьте логи** - Django показывает подробные ошибки в консоли
2. **Проверьте файл .env** - часто проблемы в настройках БД  
3. **Убедитесь что PostgreSQL запущен** и доступен
4. **Проверьте что виртуальное окружение активировано** перед запуском команд

## 🎉 После успешной установки

Вы получите:
- ✅ Полнофункциональную админ панель по адресу http://localhost:8001/admin/
- ✅ Аналитическую панель http://localhost:8001/analytics/
- ✅ Возможность управлять всем контентом проекта
- ✅ Импорт/экспорт данных в Excel
- ✅ Красивые отчеты и статистику
