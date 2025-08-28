#!/bin/bash

# FOCUSY Telegram Bot - Скрипт запуска
# Автор: FOCUSY Team
# Версия: 1.0

BOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
BOT_LOG="$BOT_DIR/bot.log"
BOT_PID="$BOT_DIR/bot.pid"

# Цвета для вывода
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Функция для вывода цветного текста
print_status() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARN]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

print_header() {
    echo -e "${BLUE}================================${NC}"
    echo -e "${BLUE}  FOCUSY Telegram Bot Manager${NC}"
    echo -e "${BLUE}================================${NC}"
}

# Проверяем, что мы в правильной директории
if [ ! -f "$BOT_DIR/bot.py" ]; then
    print_error "Файл bot.py не найден в $BOT_DIR"
    exit 1
fi

# Проверяем наличие .env файла
if [ ! -f "$BOT_DIR/.env" ]; then
    print_warning "Файл .env не найден. Создайте его на основе env_example.txt"
    if [ -f "$BOT_DIR/env_example.txt" ]; then
        print_status "Копирую env_example.txt в .env..."
        cp "$BOT_DIR/env_example.txt" "$BOT_DIR/.env"
        print_warning "Отредактируйте .env файл и добавьте ваш Telegram Bot Token"
        exit 1
    else
        print_error "Файл env_example.txt также не найден"
        exit 1
    fi
fi

# Функция запуска бота
start_bot() {
    print_status "Запуск FOCUSY Telegram Bot..."
    
    if [ -f "$BOT_PID" ]; then
        PID=$(cat "$BOT_PID")
        if ps -p $PID > /dev/null 2>&1; then
            print_warning "Бот уже запущен с PID $PID"
            return 1
        else
            print_warning "Найден устаревший PID файл, удаляю..."
            rm -f "$BOT_PID"
        fi
    fi
    
    # Переходим в директорию бота
    cd "$BOT_DIR"
    
    # Запускаем бота в фоновом режиме
    nohup python3 bot.py > "$BOT_LOG" 2>&1 &
    BOT_PID_VALUE=$!
    
    # Сохраняем PID
    echo $BOT_PID_VALUE > "$BOT_PID"
    
    # Ждем немного и проверяем
    sleep 2
    if ps -p $BOT_PID_VALUE > /dev/null 2>&1; then
        print_status "Бот успешно запущен с PID $BOT_PID_VALUE"
        print_status "Логи сохраняются в: $BOT_LOG"
        print_status "PID файл: $BOT_PID"
        return 0
    else
        print_error "Не удалось запустить бот"
        rm -f "$BOT_PID"
        return 1
    fi
}

# Функция остановки бота
stop_bot() {
    print_status "Остановка FOCUSY Telegram Bot..."
    
    if [ ! -f "$BOT_PID" ]; then
        print_warning "PID файл не найден. Бот может быть не запущен."
        return 1
    fi
    
    PID=$(cat "$BOT_PID")
    if ! ps -p $PID > /dev/null 2>&1; then
        print_warning "Процесс с PID $PID не найден. Удаляю PID файл."
        rm -f "$BOT_PID"
        return 1
    fi
    
    print_status "Отправка сигнала SIGTERM процессу $PID..."
    kill $PID
    
    # Ждем завершения
    for i in {1..10}; do
        if ! ps -p $PID > /dev/null 2>&1; then
            print_status "Бот успешно остановлен"
            rm -f "$BOT_PID"
            return 0
        fi
        sleep 1
    done
    
    print_warning "Бот не остановился за 10 секунд, принудительно завершаю..."
    kill -9 $PID
    rm -f "$BOT_PID"
    print_status "Бот принудительно остановлен"
}

# Функция проверки статуса
check_status() {
    print_status "Проверка статуса FOCUSY Telegram Bot..."
    
    if [ ! -f "$BOT_PID" ]; then
        print_warning "Бот не запущен (PID файл не найден)"
        return 1
    fi
    
    PID=$(cat "$BOT_PID")
    if ps -p $PID > /dev/null 2>&1; then
        print_status "Бот запущен с PID $PID"
        
        # Показываем последние логи
        if [ -f "$BOT_LOG" ]; then
            print_status "Последние 10 строк лога:"
            echo "----------------------------------------"
            tail -10 "$BOT_LOG"
            echo "----------------------------------------"
        fi
        
        return 0
    else
        print_warning "Бот не запущен (процесс $PID не найден)"
        rm -f "$BOT_PID"
        return 1
    fi
}

# Функция перезапуска бота
restart_bot() {
    print_status "Перезапуск FOCUSY Telegram Bot..."
    stop_bot
    sleep 2
    start_bot
}

# Функция показа логов
show_logs() {
    if [ -f "$BOT_LOG" ]; then
        print_status "Показ логов FOCUSY Telegram Bot:"
        echo "----------------------------------------"
        tail -f "$BOT_LOG"
    else
        print_warning "Файл логов не найден"
    fi
}

# Функция тестирования
test_bot() {
    print_status "Запуск тестирования FOCUSY Telegram Bot..."
    cd "$BOT_DIR"
    python3 test_bot.py
}

# Основная логика
case "$1" in
    start)
        print_header
        start_bot
        ;;
    stop)
        print_header
        stop_bot
        ;;
    restart)
        print_header
        restart_bot
        ;;
    status)
        print_header
        check_status
        ;;
    logs)
        show_logs
        ;;
    test)
        print_header
        test_bot
        ;;
    *)
        print_header
        echo "Использование: $0 {start|stop|restart|status|logs|test}"
        echo ""
        echo "Команды:"
        echo "  start   - Запустить бота"
        echo "  stop    - Остановить бота"
        echo "  restart - Перезапустить бота"
        echo "  status  - Показать статус"
        echo "  logs    - Показать логи в реальном времени"
        echo "  test    - Запустить тесты"
        echo ""
        echo "Примеры:"
        echo "  $0 start    # Запустить бота"
        echo "  $0 status   # Проверить статус"
        echo "  $0 logs     # Смотреть логи"
        ;;
esac

exit 0
