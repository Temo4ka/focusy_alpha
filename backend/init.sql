-- Создаем таблицу пользователей
CREATE TABLE users (
    user_id BIGINT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    age INT NOT NULL,
    consent_given BOOLEAN NOT NULL DEFAULT false,
    experience_points INT NOT NULL DEFAULT 0,
    coins INT NOT NULL DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Создаем таблицу заданий
CREATE TABLE tasks (
    task_id SERIAL PRIMARY KEY,
    type VARCHAR(20) NOT NULL,
    difficulty INT NOT NULL CHECK (difficulty BETWEEN 1 AND 3),
    content TEXT NOT NULL,
    correct_answer TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Создаем таблицу миссий
CREATE TABLE missions (
    mission_id SERIAL PRIMARY KEY,
    title VARCHAR(100) NOT NULL,
    description TEXT NOT NULL,
    reward_exp INT NOT NULL,
    reward_coins INT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Создаем таблицу связи пользователей и миссий
CREATE TABLE user_missions (
    user_id BIGINT REFERENCES users(user_id) ON DELETE CASCADE,
    mission_id INT REFERENCES missions(mission_id) ON DELETE CASCADE,
    is_completed BOOLEAN NOT NULL DEFAULT false,
    completed_at TIMESTAMP WITH TIME ZONE,
    PRIMARY KEY (user_id, mission_id)
);

-- Создаем таблицу попыток выполнения заданий
CREATE TABLE user_task_attempts (
    attempt_id SERIAL PRIMARY KEY,
    user_id BIGINT REFERENCES users(user_id) ON DELETE CASCADE,
    task_id INT REFERENCES tasks(task_id) ON DELETE SET NULL,
    selected_answer TEXT NOT NULL,
    is_correct BOOLEAN NOT NULL,
    attempt_time TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Создаем индексы для ускорения запросов
CREATE INDEX idx_user_missions_user_id ON user_missions(user_id);
CREATE INDEX idx_user_missions_mission_id ON user_missions(mission_id);
CREATE INDEX idx_user_task_attempts_user_id ON user_task_attempts(user_id);
CREATE INDEX idx_user_task_attempts_task_id ON user_task_attempts(task_id);