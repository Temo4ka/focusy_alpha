import logging
import asyncio
from telegram import Update, InlineKeyboardButton, InlineKeyboardMarkup
from telegram.ext import (
    Application, 
    CommandHandler, 
    MessageHandler, 
    CallbackQueryHandler,
    ConversationHandler,
    filters
)
from config import TELEGRAM_TOKEN, BOT_SETTINGS
from database import db_manager
import re

# Настройка логирования
logging.basicConfig(
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    level=logging.INFO
)
logger = logging.getLogger(__name__)

# Состояния для регистрации
CHOOSING_CLASS, ENTERING_NAME = range(2)

class FocusyBot:
    def __init__(self):
        self.application = Application.builder().token(TELEGRAM_TOKEN).build()
        self.setup_handlers()
    
    def setup_handlers(self):
        """Настройка обработчиков команд"""
        # Основные команды
        self.application.add_handler(CommandHandler("start", self.start_command))
        self.application.add_handler(CommandHandler("help", self.help_command))
        self.application.add_handler(CommandHandler("profile", self.profile_command))
        self.application.add_handler(CommandHandler("status", self.status_command))
        
        # Регистрация
        self.application.add_handler(CommandHandler("register", self.register_command))
        
        # Обработчик регистрации
        conv_handler = ConversationHandler(
            entry_points=[CommandHandler("register", self.register_command)],
            states={
                CHOOSING_CLASS: [
                    CallbackQueryHandler(self.class_selected, pattern=r'^class_\d+$'),
                    CommandHandler("cancel", self.cancel_registration)
                ],
                ENTERING_NAME: [
                    MessageHandler(filters.TEXT & ~filters.COMMAND, self.name_received),
                    CommandHandler("cancel", self.cancel_registration)
                ]
            },
            fallbacks=[CommandHandler("cancel", self.cancel_registration)]
        )
        self.application.add_handler(conv_handler)
        
        # Обработчик callback запросов
        self.application.add_handler(CallbackQueryHandler(self.button_callback))
        
        # Обработчик текстовых сообщений
        self.application.add_handler(MessageHandler(filters.TEXT & ~filters.COMMAND, self.handle_message))
    
    async def start_command(self, update: Update, context):
        """Обработчик команды /start"""
        user = update.effective_user
        telegram_id = user.id
        
        logger.info(f"Пользователь {user.first_name} (ID: {telegram_id}) запустил бота")
        
        # Проверяем, зарегистрирован ли пользователь
        if db_manager.user_exists(telegram_id):
            user_data = db_manager.get_user_by_telegram_id(telegram_id)
            welcome_text = f"""
🎉 С возвращением, {user_data['name']}!

Ваш профиль:
🆔 ID: {user_data['user_id']}
📚 Класс: {user_data['user_class']}
⭐ Опыт: {user_data['experience_points']} очков
🪙 Монеты: {user_data['coins']}

Используйте /profile для просмотра статистики
Используйте /help для списка команд
            """
        else:
            welcome_text = BOT_SETTINGS['welcome_message'] + "\n\n🚀 Для начала работы зарегистрируйтесь: /register"
        
        # Создаем клавиатуру
        keyboard = [
            [InlineKeyboardButton("📝 Зарегистрироваться", callback_data="start_register")],
            [InlineKeyboardButton("❓ Помощь", callback_data="show_help")],
            [InlineKeyboardButton("🌐 Сайт", url="http://localhost:3000")]
        ]
        
        reply_markup = InlineKeyboardMarkup(keyboard)
        
        await update.message.reply_text(welcome_text, reply_markup=reply_markup)
    
    async def help_command(self, update: Update, context):
        """Обработчик команды /help"""
        help_text = BOT_SETTINGS['help_message']
        await update.message.reply_text(help_text)
    
    async def register_command(self, update: Update, context):
        """Начало процесса регистрации"""
        user = update.effective_user
        telegram_id = user.id
        
        # Проверяем, не зарегистрирован ли уже пользователь
        if db_manager.user_exists(telegram_id):
            user_data = db_manager.get_user_by_telegram_id(telegram_id)
            await update.message.reply_text(
                f"✅ Вы уже зарегистрированы!\n\n"
                f"Имя: {user_data['name']}\n"
                f"ID: {user_data['user_id']}\n"
                f"Класс: {user_data['user_class']}"
            )
            return ConversationHandler.END
        
        # Создаем клавиатуру для выбора класса
        keyboard = [
            [InlineKeyboardButton("9 класс", callback_data="class_9")],
            [InlineKeyboardButton("10 класс", callback_data="class_10")],
            [InlineKeyboardButton("11 класс", callback_data="class_11")],
            [InlineKeyboardButton("4 класс", callback_data="class_4")]
        ]
        
        reply_markup = InlineKeyboardMarkup(keyboard)
        
        await update.message.reply_text(
            "🎓 Выберите ваш класс:",
            reply_markup=reply_markup
        )
        
        return CHOOSING_CLASS
    
    async def class_selected(self, update: Update, context):
        """Обработчик выбора класса"""
        query = update.callback_query
        await query.answer()
        
        # Извлекаем выбранный класс
        class_data = query.data
        selected_class = class_data.split('_')[1]
        
        # Сохраняем выбранный класс в контексте
        context.user_data['selected_class'] = selected_class
        
        await query.edit_message_text(
            f"📝 Теперь введите ваше имя (только имя, без фамилии):\n\n"
            f"Выбранный класс: {selected_class}\n\n"
            f"Пример: Анна, Максим, София"
        )
        
        return ENTERING_NAME
    
    async def name_received(self, update: Update, context):
        """Обработчик введенного имени"""
        user = update.effective_user
        telegram_id = user.id
        name = update.message.text.strip()
        selected_class = context.user_data.get('selected_class', '4')
        
        # Проверяем имя
        if len(name) < 2 or len(name) > 50:
            await update.message.reply_text(
                "❌ Имя должно содержать от 2 до 50 символов. Попробуйте еще раз:"
            )
            return ENTERING_NAME
        
        # Проверяем, что имя содержит только буквы и пробелы
        if not re.match(r'^[а-яёА-ЯЁ\s]+$', name):
            await update.message.reply_text(
                "❌ Имя должно содержать только русские буквы. Попробуйте еще раз:"
            )
            return ENTERING_NAME
        
        # Создаем пользователя в базе данных
        user_data = db_manager.create_user(
            telegram_id=telegram_id,
            name=name,
            user_class=selected_class
        )
        
        if user_data:
            # Создаем клавиатуру для перехода на сайт
            keyboard = [
                [InlineKeyboardButton("🌐 Перейти на сайт", url="http://localhost:3000")],
                [InlineKeyboardButton("📊 Мой профиль", callback_data="show_profile")]
            ]
            reply_markup = InlineKeyboardMarkup(keyboard)
            
            success_text = f"""
🎉 Регистрация успешно завершена!

✅ Ваши данные:
👤 Имя: {user_data['name']}
🆔 ID: {user_data['user_id']}
📚 Класс: {user_data['user_class']}
⭐ Опыт: {user_data['experience_points']} очков
🪙 Монеты: {user_data['coins']}

🚀 Теперь вы можете:
• Войти на сайт используя ваш ID: {user_data['user_id']}
• Решать задания и зарабатывать опыт
• Отслеживать прогресс обучения

Используйте команду /profile для просмотра статистики
            """
            
            await update.message.reply_text(success_text, reply_markup=reply_markup)
            
            # Очищаем данные контекста
            context.user_data.clear()
            
            return ConversationHandler.END
        else:
            await update.message.reply_text(
                "❌ Произошла ошибка при регистрации. Попробуйте еще раз или обратитесь к администратору."
            )
            return ConversationHandler.END
    
    async def cancel_registration(self, update: Update, context):
        """Отмена регистрации"""
        await update.message.reply_text(
            "❌ Регистрация отменена.\n\n"
            "Вы можете зарегистрироваться позже командой /register"
        )
        
        # Очищаем данные контекста
        context.user_data.clear()
        
        return ConversationHandler.END
    
    async def profile_command(self, update: Update, context):
        """Показать профиль пользователя"""
        user = update.effective_user
        telegram_id = user.id
        
        if not db_manager.user_exists(telegram_id):
            await update.message.reply_text(
                "❌ Вы не зарегистрированы.\n\n"
                "Используйте /register для регистрации"
            )
            return
        
        user_data = db_manager.get_user_by_telegram_id(telegram_id)
        stats = db_manager.get_user_stats(user_data['user_id'])
        
        profile_text = f"""
👤 Профиль пользователя

📝 Основная информация:
• Имя: {user_data['name']}
• ID: {user_data['user_id']}
• Класс: {user_data['user_class']}
• Дата регистрации: {user_data['created_at'].strftime('%d.%m.%Y')}

📊 Статистика:
• Опыт: {user_data['experience_points']} очков
• Монеты: {user_data['coins']}
• Всего попыток: {stats['total_attempts'] if stats else 0}
• Правильных ответов: {stats['correct_attempts'] if stats else 0}

💎 Подписка: {'Активна' if user_data['subscribe'] else 'Неактивна'}
        """
        
        # Создаем клавиатуру
        keyboard = [
            [InlineKeyboardButton("🌐 Перейти на сайт", url="http://localhost:3000")],
            [InlineKeyboardButton("📊 Обновить статистику", callback_data="refresh_stats")]
        ]
        reply_markup = InlineKeyboardMarkup(keyboard)
        
        await update.message.reply_text(profile_text, reply_markup=reply_markup)
    
    async def status_command(self, update: Update, context):
        """Показать статус регистрации"""
        user = update.effective_user
        telegram_id = user.id
        
        if db_manager.user_exists(telegram_id):
            user_data = db_manager.get_user_by_telegram_id(telegram_id)
            status_text = f"""
✅ Статус: Зарегистрирован

👤 Имя: {user_data['name']}
🆔 ID: {user_data['user_id']}
📚 Класс: {user_data['user_class']}
📅 Дата регистрации: {user_data['created_at'].strftime('%d.%m.%Y')}

🚀 Для входа на сайт используйте ID: {user_data['user_id']}
            """
        else:
            status_text = """
❌ Статус: Не зарегистрирован

Для получения доступа к заданиям необходимо зарегистрироваться.

Используйте команду /register для регистрации
            """
        
        await update.message.reply_text(status_text)
    
    async def button_callback(self, update: Update, context):
        """Обработчик нажатий на кнопки"""
        query = update.callback_query
        await query.answer()
        
        if query.data == "start_register":
            await self.register_command(update, context)
        elif query.data == "show_help":
            await query.edit_message_text(BOT_SETTINGS['help_message'])
        elif query.data == "show_profile":
            await self.profile_command(update, context)
        elif query.data == "refresh_stats":
            # Обновляем статистику
            user = update.effective_user
            telegram_id = user.id
            if db_manager.user_exists(telegram_id):
                user_data = db_manager.get_user_by_telegram_id(telegram_id)
                stats = db_manager.get_user_stats(user_data['user_id'])
                
                stats_text = f"""
📊 Обновленная статистика:

⭐ Опыт: {user_data['experience_points']} очков
🪙 Монеты: {user_data['coins']}
📝 Всего попыток: {stats['total_attempts'] if stats else 0}
✅ Правильных ответов: {stats['correct_attempts'] if stats else 0}
                """
                
                await query.edit_message_text(stats_text)
    
    async def handle_message(self, update: Update, context):
        """Обработчик текстовых сообщений"""
        user = update.effective_user
        message_text = update.message.text
        
        # Если это не команда, предлагаем зарегистрироваться
        if not message_text.startswith('/'):
            if not db_manager.user_exists(user.id):
                await update.message.reply_text(
                    "👋 Привет! Для начала работы с ботом необходимо зарегистрироваться.\n\n"
                    "Используйте команду /register"
                )
            else:
                await update.message.reply_text(
                    "💬 Используйте команды для взаимодействия с ботом:\n\n"
                    "/start - Главное меню\n"
                    "/help - Справка\n"
                    "/profile - Ваш профиль\n"
                    "/status - Статус регистрации"
                )
    
    def run_sync(self):
        """Запуск бота"""
        logger.info("🚀 Запуск FOCUSY Telegram бота...")
        
        # Проверяем подключение к базе данных
        if not db_manager.connection:
            logger.error("❌ Не удалось подключиться к базе данных")
            return
        
        # Запускаем бота
        self.application.run_polling(allowed_updates=Update.ALL_TYPES)
    
    def stop(self):
        """Остановка бота"""
        logger.info("🛑 Остановка бота...")
        db_manager.close()

if __name__ == "__main__":
    bot = FocusyBot()
    try:
        bot.run_sync()
    except KeyboardInterrupt:
        logger.info("🛑 Бот остановлен пользователем")
        bot.stop()
    except Exception as e:
        logger.error(f"❌ Критическая ошибка: {e}")
        bot.stop()
