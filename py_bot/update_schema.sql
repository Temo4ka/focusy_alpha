-- Добавление поля telegram_id в таблицу users
-- Выполните этот скрипт в PostgreSQL для обновления схемы

-- Добавляем поле telegram_id
ALTER TABLE users ADD COLUMN IF NOT EXISTS telegram_id BIGINT UNIQUE;

-- Создаем индекс для быстрого поиска по telegram_id
CREATE INDEX IF NOT EXISTS idx_users_telegram_id ON users(telegram_id);

-- Добавляем комментарий к полю
COMMENT ON COLUMN users.telegram_id IS 'Telegram ID пользователя для связи с ботом';

-- Проверяем текущую структуру таблицы
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_name = 'users' 
ORDER BY ordinal_position;
