#!/usr/bin/env python
"""
Скрипт для создания обновленного демонстрационного контента
с разнообразными типами заданий
"""

import os
import sys
import django
from django.utils import timezone
from datetime import timedelta
import random

# Настройка Django
sys.path.append(os.path.dirname(os.path.abspath(__file__)))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from content_management.models import Subject, User, Task, Mission, UserMission, UserTaskAttempt, UserMistake

def create_demo_tasks_updated(subjects):
    """Создает обновленные демонстрационные задания с разными типами"""
    russian_subject = subjects.filter(title='Русский язык').first()
    math_subject = subjects.filter(title='Математика').first()
    
    tasks_data = [
        # Русский язык - разнообразные типы
        {
            'subject': russian_subject,
            'type': 'Задание_4',
            'difficulty': 'easy',
            'content': 'Выберите правильный вариант написания слова:\n1) Сабака\n2) Собака\n3) Собакa\n4) Сабокa',
            'correct_answer': '2'
        },
        {
            'subject': russian_subject,
            'type': 'ЕГЭ_1',
            'difficulty': 'hard',
            'content': 'Укажите варианты ответов, в которых верно передана ГЛАВНАЯ информация, содержащаяся в тексте.\n\nТекст: Компьютерные технологии развиваются стремительно...',
            'correct_answer': '2, 4'
        },
        {
            'subject': russian_subject,
            'type': 'ОГЭ_5',
            'difficulty': 'medium',
            'content': 'Орфографический анализ. Укажите варианты ответов, в которых дано верное объяснение написания выделенного слова.',
            'correct_answer': '1, 3'
        },
        {
            'subject': russian_subject,
            'type': 'Олимпиада',
            'difficulty': 'hard',
            'content': 'Творческое задание: Напишите эссе на тему "Роль языка в современном мире" (не менее 200 слов)',
            'correct_answer': 'Развернутый ответ с аргументацией'
        },
        {
            'subject': russian_subject,
            'type': 'Контрольная',
            'difficulty': 'medium',
            'content': 'Разберите предложение по членам: "Солнце ярко светило над зеленым лугом."',
            'correct_answer': 'Солнце - подлежащее, светило - сказуемое, ярко - обстоятельство...'
        },
        
        # Математика - разнообразные типы
        {
            'subject': math_subject,
            'type': 'Задание_7',
            'difficulty': 'easy',
            'content': 'Решите уравнение: 2x + 5 = 13',
            'correct_answer': 'x = 4'
        },
        {
            'subject': math_subject,
            'type': 'ЕГЭ_15',
            'difficulty': 'hard',
            'content': 'Решите неравенство: log₂(x-1) > 3',
            'correct_answer': 'x > 9'
        },
        {
            'subject': math_subject,
            'type': 'ОГЭ_13',
            'difficulty': 'medium',
            'content': 'В треугольнике ABC угол C равен 90°, BC = 3, AC = 4. Найдите AB.',
            'correct_answer': '5'
        },
        {
            'subject': math_subject,
            'type': 'Олимпиада',
            'difficulty': 'hard',
            'content': 'В школе 1000 учеников. Докажите, что найдутся два ученика, у которых дни рождения совпадают.',
            'correct_answer': 'Принцип Дирихле: 1000 > 365'
        },
        {
            'subject': math_subject,
            'type': 'Проверочная',
            'difficulty': 'easy',
            'content': 'Вычислите: 15 × 7 - 23',
            'correct_answer': '82'
        },
        {
            'subject': math_subject,
            'type': 'ЕГЭ_27',
            'difficulty': 'hard',
            'content': 'Комплексная задача с параметром: При каких значениях параметра а уравнение имеет единственное решение?',
            'correct_answer': 'a = 2 или a = -3'
        },
        {
            'subject': math_subject,
            'type': 'Задание_9',
            'difficulty': 'medium',
            'content': 'Найдите площадь круга с радиусом 5 см. (π ≈ 3,14)',
            'correct_answer': '78,5 см²'
        }
    ]
    
    created_tasks = []
    for task_data in tasks_data:
        task, created = Task.objects.get_or_create(
            subject=task_data['subject'],
            type=task_data['type'],
            content=task_data['content'],
            defaults={
                'difficulty': task_data['difficulty'],
                'correct_answer': task_data['correct_answer'],
                'is_active': True
            }
        )
        if created:
            created_tasks.append(task)
            print(f"✅ Создано задание: {task.type} - {task.subject.title}")
    
    return Task.objects.all()

def main():
    """Главная функция для создания обновленного демо контента"""
    print("🚀 Создание обновленного демонстрационного контента...")
    print("=" * 60)
    
    # Получаем существующие предметы
    subjects = Subject.objects.all()
    if not subjects.exists():
        print("❌ Ошибка: Сначала создайте предметы!")
        print("   Запустите: python create_demo_content.py")
        return
    
    # Создаем обновленные задания
    print("\n📝 Создание заданий с разными типами...")
    tasks = create_demo_tasks_updated(subjects)
    
    print(f"\n✅ Успешно обновлено!")
    print(f"📚 Предметов: {subjects.count()}")
    print(f"📝 Заданий: {tasks.count()}")
    
    print("\n🎯 Новые типы заданий:")
    task_types = tasks.values_list('type', flat=True).distinct()
    for task_type in sorted(task_types):
        count = tasks.filter(type=task_type).count()
        print(f"   • {task_type}: {count} заданий")
    
    print("\n🌐 Откройте админ панель:")
    print("   http://localhost:8001/admin/")
    print("   Раздел: Задания → Посмотрите новые типы!")

if __name__ == '__main__':
    main()
