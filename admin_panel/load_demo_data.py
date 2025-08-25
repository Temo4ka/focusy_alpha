#!/usr/bin/env python3
"""
Скрипт для загрузки демонстрационных данных в админ панель FOCUSY
"""

import os
import sys
import django
from datetime import datetime, timedelta
import random

# Настройка Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from content_management.models import User, Task, Mission, UserMission, UserTaskAttempt

def create_demo_users():
    """Создает демонстрационных пользователей"""
    users_data = [
        {'user_id': 1001, 'name': 'Анна Иванова', 'age': 12, 'experience_points': 1500, 'coins': 75},
        {'user_id': 1002, 'name': 'Петр Сидоров', 'age': 11, 'experience_points': 2300, 'coins': 120},
        {'user_id': 1003, 'name': 'Мария Петрова', 'age': 13, 'experience_points': 890, 'coins': 45},
        {'user_id': 1004, 'name': 'Алексей Козлов', 'age': 12, 'experience_points': 3200, 'coins': 180},
        {'user_id': 1005, 'name': 'София Новикова', 'age': 11, 'experience_points': 1200, 'coins': 60},
    ]
    
    created_users = []
    for user_data in users_data:
        user, created = User.objects.get_or_create(
            user_id=user_data['user_id'],
            defaults={
                'name': user_data['name'],
                'age': user_data['age'],
                'experience_points': user_data['experience_points'],
                'coins': user_data['coins'],
                'consent_given': True
            }
        )
        if created:
            created_users.append(user)
    
    print(f"✅ Создано {len(created_users)} пользователей")
    return User.objects.filter(user_id__in=[u['user_id'] for u in users_data])

def create_demo_tasks():
    """Создает демонстрационные задания"""
    tasks_data = [
        {
            'type': 'multiple_choice',
            'difficulty': 1,
            'content': 'Выберите правильный вариант написания слова:\n1) Сабака\n2) Собака\n3) Сабака\n4) Собакa',
            'correct_answer': '2',
            'subject': 'russian',
            'grade_level': 4,
            'tags': 'орфография, животные'
        },
        {
            'type': 'fill_blank',
            'difficulty': 2,
            'content': 'Вставьте пропущенную букву: М_дведь',
            'correct_answer': 'е',
            'subject': 'russian',
            'grade_level': 4,
            'tags': 'орфография, животные'
        },
        {
            'type': 'true_false',
            'difficulty': 1,
            'content': 'Верно ли утверждение: "Имена собственные пишутся с большой буквы"',
            'correct_answer': 'Верно',
            'subject': 'russian',
            'grade_level': 4,
            'tags': 'правила, заглавные буквы'
        },
        {
            'type': 'multiple_choice',
            'difficulty': 3,
            'content': 'В каком слове ударение падает на второй слог?\n1) Телефон\n2) Компьютер\n3) Радио\n4) Музыка',
            'correct_answer': '3',
            'subject': 'russian',
            'grade_level': 5,
            'tags': 'ударение, фонетика'
        },
        {
            'type': 'fill_blank',
            'difficulty': 2,
            'content': 'Определите падеж слова "книгой": Я читаю _____ .',
            'correct_answer': 'творительный падеж',
            'subject': 'russian',
            'grade_level': 5,
            'tags': 'падежи, морфология'
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
    
    print(f"✅ Создано {len(created_tasks)} заданий")
    return Task.objects.all()

def create_demo_missions():
    """Создает демонстрационные миссии"""
    missions_data = [
        {
            'title': 'Первые шаги',
            'description': 'Выполните 5 заданий на орфографию',
            'reward_exp': 100,
            'reward_coins': 25,
            'difficulty_level': 1,
            'required_tasks': 5
        },
        {
            'title': 'Знаток правил',
            'description': 'Выполните 10 заданий с точностью 80%',
            'reward_exp': 250,
            'reward_coins': 50,
            'difficulty_level': 2,
            'required_tasks': 10
        },
        {
            'title': 'Мастер языка',
            'description': 'Выполните 20 заданий повышенной сложности',
            'reward_exp': 500,
            'reward_coins': 100,
            'difficulty_level': 3,
            'required_tasks': 20
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
    
    print(f"✅ Создано {len(created_missions)} миссий")
    return Mission.objects.all()

def create_demo_attempts(users, tasks):
    """Создает демонстрационные попытки выполнения заданий"""
    attempts_created = 0
    
    for user in users:
        # Каждый пользователь выполняет случайное количество заданий
        num_attempts = random.randint(3, 8)
        user_tasks = random.sample(list(tasks), min(num_attempts, len(tasks)))
        
        for task in user_tasks:
            # Случайная вероятность правильного ответа (70%)
            is_correct = random.random() < 0.7
            
            # Генерируем случайный ответ
            if is_correct:
                selected_answer = task.correct_answer
            else:
                wrong_answers = ['1', '2', '3', '4', 'неправильный ответ']
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
    
    print(f"✅ Создано {attempts_created} попыток выполнения")

def create_demo_user_missions(users, missions):
    """Создает связи пользователей с миссиями"""
    user_missions_created = 0
    
    for user in users:
        # Каждый пользователь участвует в 1-2 миссиях
        user_missions = random.sample(list(missions), random.randint(1, 2))
        
        for mission in user_missions:
            # 30% шанс что миссия завершена
            is_completed = random.random() < 0.3
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
    """Основная функция загрузки демо данных"""
    print("🎯 Загрузка демонстрационных данных для FOCUSY")
    print("=" * 50)
    
    try:
        # Создаем демо данные
        users = create_demo_users()
        tasks = create_demo_tasks()
        missions = create_demo_missions()
        
        # Создаем связанные данные
        create_demo_attempts(users, tasks)
        create_demo_user_missions(users, missions)
        
        print("\n" + "=" * 50)
        print("🎉 Демонстрационные данные загружены!")
        print("\n📊 Теперь в админ панели вы увидите:")
        print(f"   👥 {users.count()} пользователей")
        print(f"   📝 {tasks.count()} заданий")
        print(f"   🎯 {missions.count()} миссий")
        print(f"   📈 Статистику выполнения")
        print("\n🌐 Откройте админ панель:")
        print("   http://localhost:8001/admin/")
        print("   http://localhost:8001/analytics/")
        
    except Exception as e:
        print(f"❌ Ошибка при загрузке данных: {e}")
        sys.exit(1)

if __name__ == '__main__':
    main()
