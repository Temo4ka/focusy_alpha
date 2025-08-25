from django.db import models
from django.core.validators import MinValueValidator, MaxValueValidator
from django.utils import timezone


class Subject(models.Model):
    """Модель предмета"""
    title = models.CharField(max_length=100, verbose_name="Заголовок")
    description = models.TextField(verbose_name="Описание")
    image = models.ImageField(upload_to='subjects/', verbose_name="Картинка", blank=True, null=True)
    is_active = models.BooleanField(default=True, verbose_name="Активен")
    created_at = models.DateTimeField(default=timezone.now, verbose_name="Дата создания")

    class Meta:
        verbose_name = 'Предмет'
        verbose_name_plural = 'Предметы'
        ordering = ['title']

    def __str__(self):
        return self.title


class User(models.Model):
    """Модель пользователя"""
    user_id = models.BigIntegerField(primary_key=True, verbose_name="Telegram ID пользователя")
    name = models.CharField(max_length=100, verbose_name="Имя пользователя")
    user_class = models.CharField(max_length=10, default="4", verbose_name="Класс", help_text="В каком классе учится")
    consent_given = models.BooleanField(default=False, verbose_name="Согласие на обработку данных")
    experience_points = models.IntegerField(default=0, verbose_name="Очки опыта")
    coins = models.IntegerField(default=0, verbose_name="Монеты")
    subscribe = models.BooleanField(default=False, verbose_name="Подписка")
    created_at = models.DateTimeField(default=timezone.now, verbose_name="Дата регистрации")

    class Meta:
        db_table = 'users'
        verbose_name = 'Пользователь'
        verbose_name_plural = 'Пользователи'
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.name} (ID: {self.user_id})"

    @property
    def level(self):
        """Вычисляет уровень пользователя на основе опыта"""
        return (self.experience_points // 1000) + 1

    @property
    def tasks_completed(self):
        """Количество выполненных заданий"""
        return self.usertaskattempt_set.filter(is_correct=True).count()

    @property
    def missions_completed(self):
        """Количество завершенных миссий"""
        return self.usermission_set.filter(is_completed=True).count()

    @property
    def mistakes_count(self):
        """Количество ошибок"""
        return self.usertaskattempt_set.filter(is_correct=False).count()


class Task(models.Model):
    """Модель задания"""
    DIFFICULTY_CHOICES = [
        ('easy', 'Легкий'),
        ('medium', 'Средний'),
        ('hard', 'Сложный'),
    ]

    task_id = models.AutoField(primary_key=True, verbose_name="ID задания")
    subject = models.ForeignKey(Subject, on_delete=models.CASCADE, verbose_name="Предмет")
    type = models.CharField(
        max_length=50, 
        verbose_name="Тип задания",
        help_text="Например: Задание_4, Задание_7, ЕГЭ_1, ОГЭ_15, и т.д."
    )
    difficulty = models.CharField(
        max_length=10,
        choices=DIFFICULTY_CHOICES,
        verbose_name="Уровень сложности"
    )
    content = models.TextField(verbose_name="Содержание задания")
    correct_answer = models.TextField(verbose_name="Правильный ответ")
    is_active = models.BooleanField(default=True, verbose_name="Активно")
    created_at = models.DateTimeField(default=timezone.now, verbose_name="Дата создания")

    class Meta:
        db_table = 'tasks'
        verbose_name = 'Задание'
        verbose_name_plural = 'Задания'
        ordering = ['-created_at']

    def __str__(self):
        return f"Задание #{self.task_id} ({self.get_difficulty_display()}) - {self.subject.title}"

    @property
    def attempts_count(self):
        """Общее количество попыток"""
        return self.usertaskattempt_set.count()

    @property
    def success_rate(self):
        """Процент правильных ответов"""
        total = self.attempts_count
        if total == 0:
            return 0
        correct = self.usertaskattempt_set.filter(is_correct=True).count()
        return round((correct / total) * 100, 1)


class Mission(models.Model):
    """Модель миссии"""
    mission_id = models.AutoField(primary_key=True, verbose_name="ID миссии")
    title = models.CharField(max_length=100, verbose_name="Название миссии")
    description = models.TextField(verbose_name="Описание миссии")
    reward_exp = models.IntegerField(verbose_name="Награда (опыт)")
    reward_coins = models.IntegerField(verbose_name="Награда (монеты)")
    is_active = models.BooleanField(default=True, verbose_name="Активна")
    created_at = models.DateTimeField(default=timezone.now, verbose_name="Дата создания")

    class Meta:
        db_table = 'missions'
        verbose_name = 'Миссия'
        verbose_name_plural = 'Миссии'
        ordering = ['-created_at']

    def __str__(self):
        return self.title

    @property
    def completion_count(self):
        """Количество завершений миссии"""
        return self.usermission_set.filter(is_completed=True).count()


class UserMission(models.Model):
    """Миссии пользователя"""
    user = models.ForeignKey(User, on_delete=models.CASCADE, verbose_name="Пользователь")
    mission = models.ForeignKey(Mission, on_delete=models.CASCADE, verbose_name="Миссия")
    is_completed = models.BooleanField(default=False, verbose_name="Завершена")
    completed_at = models.DateTimeField(null=True, blank=True, verbose_name="Дата завершения")

    class Meta:
        db_table = 'user_missions'
        verbose_name = 'Миссия пользователя'
        verbose_name_plural = 'Миссии пользователей'
        unique_together = ['user', 'mission']

    def __str__(self):
        status = "Завершена" if self.is_completed else "В процессе"
        return f"{self.user.name} - {self.mission.title} ({status})"


class UserTaskAttempt(models.Model):
    """История решений (попытки выполнения заданий)"""
    attempt_id = models.AutoField(primary_key=True, verbose_name="ID попытки")
    user = models.ForeignKey(User, on_delete=models.CASCADE, verbose_name="Пользователь")
    task = models.ForeignKey(Task, on_delete=models.SET_NULL, null=True, verbose_name="Задание")
    selected_answer = models.TextField(verbose_name="Выбранный ответ")
    is_correct = models.BooleanField(verbose_name="Правильный ответ")
    attempt_time = models.DateTimeField(default=timezone.now, verbose_name="Время попытки")

    class Meta:
        db_table = 'user_task_attempts'
        verbose_name = 'История решения'
        verbose_name_plural = 'История решений'
        ordering = ['-attempt_time']

    def __str__(self):
        result = "✓" if self.is_correct else "✗"
        return f"{self.user.name} - Задание #{self.task.task_id if self.task else 'N/A'} {result}"


class UserMistake(models.Model):
    """История ошибок пользователя"""
    user = models.ForeignKey(User, on_delete=models.CASCADE, verbose_name="Пользователь")
    task = models.ForeignKey(Task, on_delete=models.CASCADE, verbose_name="Задание")
    mistake_text = models.TextField(verbose_name="Текст ошибки")
    correct_answer = models.TextField(verbose_name="Правильный ответ")
    user_answer = models.TextField(verbose_name="Ответ пользователя")
    created_at = models.DateTimeField(default=timezone.now, verbose_name="Дата ошибки")

    class Meta:
        verbose_name = 'Ошибка пользователя'
        verbose_name_plural = 'Ошибки пользователей'
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.user.name} - Ошибка в задании #{self.task.task_id}"