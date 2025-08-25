from django.contrib import admin
from django.db.models import Count, Q, Avg
from django.utils.html import format_html
from django.urls import reverse
from django.utils.safestring import mark_safe
from .models import Subject, User, Task, Mission, UserMission, UserTaskAttempt, UserMistake


@admin.register(Subject)
class SubjectAdmin(admin.ModelAdmin):
    list_display = ['title', 'description_short', 'image_display', 'tasks_count', 'is_active', 'created_at']
    list_filter = ['is_active', 'created_at']
    search_fields = ['title', 'description']
    list_editable = ['is_active']
    ordering = ['title']
    
    fieldsets = (
        ('Основная информация', {
            'fields': ('title', 'description', 'image', 'is_active')
        }),
        ('Дополнительно', {
            'fields': ('created_at',),
            'classes': ('collapse',)
        }),
    )
    readonly_fields = ['created_at']

    def description_short(self, obj):
        if len(obj.description) > 50:
            return obj.description[:50] + "..."
        return obj.description
    description_short.short_description = "Описание"

    def image_display(self, obj):
        if obj.image:
            return format_html('<img src="{}" width="50" height="50" style="border-radius: 5px;" />', obj.image.url)
        return "Нет изображения"
    image_display.short_description = "Картинка"

    def tasks_count(self, obj):
        count = obj.task_set.count()
        color = 'green' if count > 0 else 'orange'
        return format_html('<span style="color: {}; font-weight: bold;">{}</span>', color, count)
    tasks_count.short_description = "Заданий"


@admin.register(User)
class UserAdmin(admin.ModelAdmin):
    list_display = ['user_id', 'name', 'user_class', 'level_display', 'experience_points', 'coins', 'tasks_completed_display', 'missions_completed_display', 'mistakes_count_display', 'subscribe', 'consent_given', 'created_at']
    list_filter = ['user_class', 'subscribe', 'consent_given', 'created_at']
    search_fields = ['name', 'user_id']
    readonly_fields = ['user_id', 'created_at', 'level_display', 'tasks_completed_display', 'missions_completed_display', 'mistakes_count_display']
    ordering = ['-experience_points']
    
    fieldsets = (
        ('Основная информация', {
            'fields': ('user_id', 'name', 'user_class', 'consent_given', 'subscribe', 'created_at')
        }),
        ('Прогресс', {
            'fields': ('experience_points', 'coins', 'level_display', 'tasks_completed_display', 'missions_completed_display', 'mistakes_count_display')
        }),
    )

    def level_display(self, obj):
        return f"Уровень {obj.level}"
    level_display.short_description = "Уровень"

    def tasks_completed_display(self, obj):
        count = obj.tasks_completed
        color = 'green' if count > 10 else 'orange' if count > 5 else 'red'
        return format_html('<span style="color: {}; font-weight: bold;">{}</span>', color, count)
    tasks_completed_display.short_description = "Выполнено заданий"

    def missions_completed_display(self, obj):
        count = obj.missions_completed
        color = 'green' if count > 3 else 'orange' if count > 1 else 'red'
        return format_html('<span style="color: {}; font-weight: bold;">{}</span>', color, count)
    missions_completed_display.short_description = "Завершено миссий"

    def mistakes_count_display(self, obj):
        count = obj.mistakes_count
        color = 'red' if count > 10 else 'orange' if count > 5 else 'green'
        return format_html('<span style="color: {}; font-weight: bold;">{}</span>', color, count)
    mistakes_count_display.short_description = "Ошибок"

    actions = ['add_bonus_points', 'add_bonus_coins', 'activate_subscription']

    def add_bonus_points(self, request, queryset):
        for user in queryset:
            user.experience_points += 100
            user.save()
        self.message_user(request, f"Добавлено 100 очков опыта для {queryset.count()} пользователей")
    add_bonus_points.short_description = "Добавить 100 очков опыта"

    def add_bonus_coins(self, request, queryset):
        for user in queryset:
            user.coins += 50
            user.save()
        self.message_user(request, f"Добавлено 50 монет для {queryset.count()} пользователей")
    add_bonus_coins.short_description = "Добавить 50 монет"

    def activate_subscription(self, request, queryset):
        updated = queryset.update(subscribe=True)
        self.message_user(request, f"Активирована подписка для {updated} пользователей")
    activate_subscription.short_description = "Активировать подписку"


@admin.register(Task)
class TaskAdmin(admin.ModelAdmin):
    list_display = ['task_id', 'subject', 'type', 'difficulty_display', 'content_short', 'attempts_display', 'success_rate_display', 'is_active', 'created_at']
    list_filter = ['subject', 'type', 'difficulty', 'is_active', 'created_at']
    search_fields = ['content', 'task_id']
    list_editable = ['is_active']
    ordering = ['-created_at']
    
    fieldsets = (
        ('Основная информация', {
            'fields': ('subject', 'type', 'difficulty', 'is_active'),
            'description': 'Базовые параметры задания. Тип можно указать любой (например: Задание_4, ЕГЭ_1, ОГЭ_15)'
        }),
        ('Содержание', {
            'fields': ('content', 'correct_answer')
        }),
        ('Статистика', {
            'fields': ('attempts_display', 'success_rate_display', 'created_at'),
            'classes': ('collapse',)
        }),
    )
    readonly_fields = ['task_id', 'created_at', 'attempts_display', 'success_rate_display']

    def content_short(self, obj):
        if len(obj.content) > 50:
            return obj.content[:50] + "..."
        return obj.content
    content_short.short_description = "Содержание"

    def difficulty_display(self, obj):
        colors = {'easy': '#28a745', 'medium': '#ffc107', 'hard': '#dc3545'}
        return format_html(
            '<span style="color: {}; font-weight: bold;">{}</span>',
            colors.get(obj.difficulty, '#6c757d'),
            obj.get_difficulty_display()
        )
    difficulty_display.short_description = "Сложность"

    def attempts_display(self, obj):
        count = obj.attempts_count
        return format_html('<strong>{}</strong>', count)
    attempts_display.short_description = "Попыток"

    def success_rate_display(self, obj):
        rate = obj.success_rate
        color = 'green' if rate >= 70 else 'orange' if rate >= 50 else 'red'
        return format_html('<span style="color: {};">{}</span>', color, f'{rate:.1f}%')
    success_rate_display.short_description = "Успешность"

    actions = ['activate_tasks', 'deactivate_tasks', 'duplicate_tasks']

    def activate_tasks(self, request, queryset):
        updated = queryset.update(is_active=True)
        self.message_user(request, f"Активировано {updated} заданий")
    activate_tasks.short_description = "Активировать выбранные задания"

    def deactivate_tasks(self, request, queryset):
        updated = queryset.update(is_active=False)
        self.message_user(request, f"Деактивировано {updated} заданий")
    deactivate_tasks.short_description = "Деактивировать выбранные задания"

    def duplicate_tasks(self, request, queryset):
        for task in queryset:
            task.pk = None
            task.content = f"[КОПИЯ] {task.content}"
            task.save()
        self.message_user(request, f"Создано {queryset.count()} копий заданий")
    duplicate_tasks.short_description = "Дублировать выбранные задания"


@admin.register(Mission)
class MissionAdmin(admin.ModelAdmin):
    list_display = ['mission_id', 'title', 'description_short', 'reward_exp', 'reward_coins', 'completion_count_display', 'is_active', 'created_at']
    list_filter = ['is_active', 'created_at']
    search_fields = ['title', 'description']
    list_editable = ['is_active']
    ordering = ['-created_at']

    fieldsets = (
        ('Основная информация', {
            'fields': ('title', 'description', 'is_active')
        }),
        ('Награды', {
            'fields': ('reward_exp', 'reward_coins')
        }),
        ('Статистика', {
            'fields': ('completion_count_display', 'created_at'),
            'classes': ('collapse',)
        }),
    )
    readonly_fields = ['mission_id', 'created_at', 'completion_count_display']

    def description_short(self, obj):
        if len(obj.description) > 50:
            return obj.description[:50] + "..."
        return obj.description
    description_short.short_description = "Описание"

    def completion_count_display(self, obj):
        count = obj.completion_count
        color = 'green' if count > 50 else 'orange' if count > 10 else 'red'
        return format_html('<span style="color: {}; font-weight: bold;">{}</span>', color, count)
    completion_count_display.short_description = "Завершений"


@admin.register(UserMission)
class UserMissionAdmin(admin.ModelAdmin):
    list_display = ['user', 'mission', 'is_completed', 'completed_at']
    list_filter = ['is_completed', 'completed_at', 'mission']
    search_fields = ['user__name', 'mission__title']
    raw_id_fields = ['user', 'mission']
    date_hierarchy = 'completed_at'
    
    def get_queryset(self, request):
        return super().get_queryset(request).select_related('user', 'mission')


@admin.register(UserTaskAttempt)
class UserTaskAttemptAdmin(admin.ModelAdmin):
    list_display = ['user', 'task_info', 'selected_answer_short', 'is_correct_display', 'attempt_time']
    list_filter = ['is_correct', 'task__difficulty', 'task__type', 'attempt_time']
    search_fields = ['user__name', 'task__content', 'selected_answer']
    raw_id_fields = ['user', 'task']
    date_hierarchy = 'attempt_time'
    readonly_fields = ['attempt_id', 'attempt_time']

    def get_queryset(self, request):
        return super().get_queryset(request).select_related('user', 'task')

    def task_info(self, obj):
        if obj.task:
            return f"#{obj.task.task_id} ({obj.task.get_difficulty_display()})"
        return "Задание удалено"
    task_info.short_description = "Задание"

    def selected_answer_short(self, obj):
        if len(obj.selected_answer) > 50:
            return obj.selected_answer[:50] + "..."
        return obj.selected_answer
    selected_answer_short.short_description = "Ответ"

    def is_correct_display(self, obj):
        if obj.is_correct:
            return format_html('<span style="color: green; font-weight: bold;">✓ Правильно</span>')
        else:
            return format_html('<span style="color: red; font-weight: bold;">✗ Неправильно</span>')
    is_correct_display.short_description = "Результат"


@admin.register(UserMistake)
class UserMistakeAdmin(admin.ModelAdmin):
    list_display = ['user', 'task', 'mistake_text_short', 'user_answer_short', 'correct_answer_short', 'created_at']
    list_filter = ['task__subject', 'task__difficulty', 'created_at']
    search_fields = ['user__name', 'task__content', 'mistake_text']
    raw_id_fields = ['user', 'task']
    date_hierarchy = 'created_at'
    readonly_fields = ['created_at']

    def get_queryset(self, request):
        return super().get_queryset(request).select_related('user', 'task')

    def mistake_text_short(self, obj):
        if len(obj.mistake_text) > 30:
            return obj.mistake_text[:30] + "..."
        return obj.mistake_text
    mistake_text_short.short_description = "Ошибка"

    def user_answer_short(self, obj):
        if len(obj.user_answer) > 20:
            return obj.user_answer[:20] + "..."
        return obj.user_answer
    user_answer_short.short_description = "Ответ пользователя"

    def correct_answer_short(self, obj):
        if len(obj.correct_answer) > 20:
            return obj.correct_answer[:20] + "..."
        return obj.correct_answer
    correct_answer_short.short_description = "Правильный ответ"


# Кастомизация главной страницы админки
admin.site.site_header = "FOCUSY - Панель администратора"
admin.site.site_title = "FOCUSY Admin"
admin.site.index_title = "Управление образовательной платформой"
admin.site.enable_nav_sidebar = False