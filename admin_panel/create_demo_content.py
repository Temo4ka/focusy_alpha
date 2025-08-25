#!/usr/bin/env python3
"""
Скрипт создания демонстрационного контента для FOCUSY админ панели
"""

import os
import sys
import django
from datetime import datetime, timedelta
import random

# Настройка Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from content_management.models import Subject, User, Task, Mission, UserMission, UserTaskAttempt, UserMistake

def create_subjects():
    """Создает предметы"""
    subjects_data = [
        {
            'title': 'Русский язык',
            'description': 'Изучение русского языка: орфография, грамматика, синтаксис. Развитие навыков чтения и письма.',
        },
        {
            'title': 'Математика',
            'description': 'Основы математики: арифметика, геометрия, алгебра. Решение задач и примеров.',
        },
        {
            'title': 'Окружающий мир',
            'description': 'Изучение природы, животных, растений, экологии и окружающей среды.',
        },
        {
            'title': 'Литературное чтение',
            'description': 'Чтение и анализ художественных произведений, развитие навыков понимания текста.',
        }
    ]
    
    created_subjects = []
    for subject_data in subjects_data:
        subject, created = Subject.objects.get_or_create(
            title=subject_data['title'],
            defaults=subject_data
        )
        if created:
            created_subjects.append(subject)
            print(f"✅ Создан предмет: {subject.title}")
    
    return Subject.objects.all()

def create_demo_users():
    """Создает демонстрационных пользователей"""
    users_data = [
        {'user_id': 1001, 'name': 'Анна Иванова', 'user_class': '4', 'experience_points': 1500, 'coins': 75, 'subscribe': True},
        {'user_id': 1002, 'name': 'Петр Сидоров', 'user_class': '5', 'experience_points': 2300, 'coins': 120, 'subscribe': False},
        {'user_id': 1003, 'name': 'Мария Петрова', 'user_class': '4', 'experience_points': 890, 'coins': 45, 'subscribe': True},
        {'user_id': 1004, 'name': 'Алексей Козлов', 'user_class': '6', 'experience_points': 3200, 'coins': 180, 'subscribe': True},
        {'user_id': 1005, 'name': 'София Новикова', 'user_class': '5', 'experience_points': 1200, 'coins': 60, 'subscribe': False},
        {'user_id': 1006, 'name': 'Дмитрий Волков', 'user_class': '4', 'experience_points': 450, 'coins': 25, 'subscribe': False},
        {'user_id': 1007, 'name': 'Елена Морозова', 'user_class': '7', 'experience_points': 2800, 'coins': 140, 'subscribe': True},
    ]
    
    created_users = []
    for user_data in users_data:
        user_data['consent_given'] = True
        user, created = User.objects.get_or_create(
            user_id=user_data['user_id'],
            defaults=user_data
        )
        if created:
            created_users.append(user)
            print(f"✅ Создан пользователь: {user.name}")
    
    return User.objects.all()

def create_demo_tasks(subjects):
    """Создает демонстрационные задания"""
    russian_subject = subjects.filter(title='Русский язык').first()
    math_subject = subjects.filter(title='Математика').first()
    
    tasks_data = [
        # Русский язык
        {
            'subject': russian_subject,
            'type': 'Задание_4',
            'difficulty': 'easy',
            'content': 'Выберите правильный вариант написания слова:\n1) Сабака\n2) Собака\n3) Собакa\n4) Сабокa',
            'correct_answer': '2'
        },
        {
            'subject': russian_subject,
            'type': 'Задание_4',
            'difficulty': 'medium',
            'content': 'Вставьте пропущенную букву: М_дведь',
            'correct_answer': 'е'
        },
        {
            'subject': russian_subject,
            'type': 'Задание_5',
            'difficulty': 'easy',
            'content': 'Верно ли утверждение: "Имена собственные пишутся с большой буквы"',
            'correct_answer': 'Верно'
        },
        {
            'subject': russian_subject,
            'type': 'Задание_6',
            'difficulty': 'hard',
            'content': 'В каком слове ударение падает на второй слог?\n1) Телефон\n2) Компьютер\n3) Радио\n4) Музыка',
            'correct_answer': '3'
        },
        {
            'subject': russian_subject,
            'type': 'Задание_5',
            'difficulty': 'medium',
            'content': 'Определите падеж слова "книгой": Я читаю _____.',
            'correct_answer': 'творительный падеж'
        },
        
        # Математика
        {
            'subject': math_subject,
            'type': 'Задание_4',
            'difficulty': 'easy',
            'content': 'Сколько будет 25 + 37?\n1) 52\n2) 62\n3) 72\n4) 82',
            'correct_answer': '2'
        },
        {
            'subject': math_subject,
            'type': 'Задание_4',
            'difficulty': 'medium',
            'content': 'Найдите значение выражения: 8 × 9 - 15',
            'correct_answer': '57'
        },
        {
            'subject': math_subject,
            'type': 'Задание_5',
            'difficulty': 'hard',
            'content': 'Решите уравнение: 3x + 12 = 30',
            'correct_answer': '6'
        },
        {
            'subject': math_subject,
            'type': 'Задание_6',
            'difficulty': 'medium',
            'content': 'Найдите площадь прямоугольника со сторонами 8 см и 5 см',
            'correct_answer': '40'
        },
        {
            'subject': math_subject,
            'type': 'Задание_7',
            'difficulty': 'hard',
            'content': 'Упростите выражение: 2(x + 3) + 4x',
            'correct_answer': '6x + 6'
        }
    ]
    
    created_tasks = []
    for task_data in tasks_data:
        task, created = Task.objects.get_or_create(
            content=task_data['content'],
            defaults=task_data
        )
        if created:
            created_tasks.append(task)
            print(f"✅ Создано задание: {task.subject.title} - {task.type}")
    
    return Task.objects.all()

def create_demo_missions():
    """Создает демонстрационные миссии"""
    missions_data = [
        {
            'title': 'Первые шаги',
            'description': 'Выполните 5 заданий любой сложности',
            'reward_exp': 100,
            'reward_coins': 25
        },
        {
            'title': 'Знаток русского языка',
            'description': 'Правильно решите 10 заданий по русскому языку',
            'reward_exp': 250,
            'reward_coins': 50
        },
        {
            'title': 'Математический гений',
            'description': 'Решите 15 математических задач',
            'reward_exp': 350,
            'reward_coins': 75
        },
        {
            'title': 'Отличник',
            'description': 'Наберите 1000 очков опыта',
            'reward_exp': 500,
            'reward_coins': 100
        },
        {
            'title': 'Настойчивый ученик',
            'description': 'Выполните 50 заданий подряд',
            'reward_exp': 800,
            'reward_coins': 150
        }
    ]
    
    created_missions = []
    for mission_data in missions_data:
        mission, created = Mission.objects.get_or_create(
            title=mission_data['title'],
            defaults=mission_data
        )
        if created:
            created_missions.append(mission)
            print(f"✅ Создана миссия: {mission.title}")
    
    return Mission.objects.all()

def create_demo_attempts_and_mistakes(users, tasks):
    """Создает демонстрационные попытки и ошибки"""
    attempts_created = 0
    mistakes_created = 0
    
    for user in users:
        # Каждый пользователь выполняет случайное количество заданий
        num_attempts = random.randint(5, 15)
        user_tasks = random.sample(list(tasks), min(num_attempts, len(tasks)))
        
        for task in user_tasks:
            # Случайная вероятность правильного ответа (75%)
            is_correct = random.random() < 0.75
            
            # Генерируем ответ
            if is_correct:
                selected_answer = task.correct_answer
            else:
                wrong_answers = ['1', '3', '4', 'неправильный ответ', 'не знаю']
                selected_answer = random.choice(wrong_answers)
            
            # Случайное время в последние 30 дней
            days_ago = random.randint(0, 30)
            attempt_time = datetime.now() - timedelta(days=days_ago)
            
            attempt, created = UserTaskAttempt.objects.get_or_create(
                user=user,
                task=task,
                defaults={
                    'selected_answer': selected_answer,
                    'is_correct': is_correct,
                    'attempt_time': attempt_time
                }
            )
            
            if created:
                attempts_created += 1
                
                # Если ответ неправильный, создаем ошибку
                if not is_correct:
                    mistake_texts = [
                        'Ошибка в выборе правильного варианта',
                        'Неверное понимание задания',
                        'Арифметическая ошибка',
                        'Орфографическая ошибка',
                        'Невнимательность при чтении'
                    ]
                    
                    UserMistake.objects.create(
                        user=user,
                        task=task,
                        mistake_text=random.choice(mistake_texts),
                        correct_answer=task.correct_answer,
                        user_answer=selected_answer,
                        created_at=attempt_time
                    )
                    mistakes_created += 1
    
    print(f"✅ Создано {attempts_created} попыток выполнения")
    print(f"✅ Создано {mistakes_created} ошибок")

def create_demo_user_missions(users, missions):
    """Создает связи пользователей с миссиями"""
    user_missions_created = 0
    
    for user in users:
        # Каждый пользователь участвует в 2-3 миссиях
        user_missions = random.sample(list(missions), random.randint(2, 3))
        
        for mission in user_missions:
            # 40% шанс что миссия завершена
            is_completed = random.random() < 0.4
            completed_at = None
            
            if is_completed:
                days_ago = random.randint(1, 20)
                completed_at = datetime.now() - timedelta(days=days_ago)
            
            user_mission, created = UserMission.objects.get_or_create(
                user=user,
                mission=mission,
                defaults={
                    'is_completed': is_completed,
                    'completed_at': completed_at
                }
            )
            
            if created:
                user_missions_created += 1
    
    print(f"✅ Создано {user_missions_created} связей пользователь-миссия")

def main():
    """Основная функция создания демо данных"""
    print("🎯 Создание демонстрационного контента для FOCUSY")
    print("=" * 50)
    
    try:
        # Создаем демо данные
        print("\n1️⃣ Создание предметов...")
        subjects = create_subjects()
        
        print("\n2️⃣ Создание пользователей...")
        users = create_demo_users()
        
        print("\n3️⃣ Создание заданий...")
        tasks = create_demo_tasks(subjects)
        
        print("\n4️⃣ Создание миссий...")
        missions = create_demo_missions()
        
        print("\n5️⃣ Создание попыток и ошибок...")
        create_demo_attempts_and_mistakes(users, tasks)
        
        print("\n6️⃣ Создание связей пользователь-миссия...")
        create_demo_user_missions(users, missions)
        
        print("\n" + "=" * 50)
        print("🎉 Демонстрационный контент создан!")
        print("\n📊 Создано:")
        print(f"   📚 {subjects.count()} предметов")
        print(f"   👥 {users.count()} пользователей")
        print(f"   📝 {tasks.count()} заданий")
        print(f"   🎯 {missions.count()} миссий")
        print(f"   📈 Статистика выполнения и ошибки")
        
        print("\n🌐 Теперь откройте админ панель:")
        print("   http://localhost:8001/admin/")
        
    except Exception as e:
        print(f"❌ Ошибка при создании данных: {e}")
        sys.exit(1)

if __name__ == '__main__':
    main()
