#!/usr/bin/env python3
"""
Скрипт для импорта заданий по русскому языку из Excel файлов в базу данных
"""

import os
import sys
import django
import pandas as pd
from datetime import datetime

# Настройка Django
sys.path.append(os.path.dirname(os.path.abspath(__file__)))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from content_management.models import Subject, Task

def import_russian_tasks():
    """Импортирует задания по русскому языку из Excel файлов"""
    
    # Получаем предмет "Русский язык"
    try:
        russian_subject = Subject.objects.get(title='Русский язык')
        print(f"✅ Найден предмет: {russian_subject.title}")
    except Subject.DoesNotExist:
        print("❌ Предмет 'Русский язык' не найден в базе данных")
        return
    
    # Путь к директории с Excel файлами
    excel_dir = os.path.join(os.path.dirname(__file__), '..', 'backend', 'exel_format_tasks')
    
    # Список файлов для импорта
    files_to_import = [
        {
            'filename': 'Задание 4_ударения.xlsx',
            'type': 'Задание_4',
            'difficulty': 'medium'
        },
        {
            'filename': '7 – МОРФОЛОГИЯ.xlsx',
            'type': 'Задание_7',
            'difficulty': 'medium'
        },
        {
            'filename': 'задание 9.xlsx',
            'type': 'Задание_9',
            'difficulty': 'hard'
        },
        {
            'filename': 'Задание 10_ русский.xlsx',
            'type': 'Задание_10',
            'difficulty': 'hard'
        }
    ]
    
    total_imported = 0
    
    for file_info in files_to_import:
        filepath = os.path.join(excel_dir, file_info['filename'])
        
        if not os.path.exists(filepath):
            print(f"❌ Файл не найден: {file_info['filename']}")
            continue
            
        print(f"\n📁 Обрабатываю файл: {file_info['filename']}")
        print(f"   Тип: {file_info['type']}, Сложность: {file_info['difficulty']}")
        
        try:
            # Читаем Excel файл
            df = pd.read_excel(filepath)
            print(f"   📊 Загружено {len(df)} строк")
            
            # Очищаем данные
            df = df.dropna(subset=['Задание'])  # Убираем строки без задания
            
            imported_count = 0
            
            for index, row in df.iterrows():
                try:
                    # Формируем содержание задания
                    if 'Слово к заданию' in df.columns and pd.notna(row.get('Слово к заданию')):
                        content = f"{row['Задание']}\n\nСлово: {row['Слово к заданию']}"
                    else:
                        content = str(row['Задание'])
                    
                    # Формируем правильный ответ
                    correct_answer = str(row.get('Вариант верный', ''))
                    
                    # Проверяем, не существует ли уже такое задание
                    existing_task = Task.objects.filter(
                        subject=russian_subject,
                        type=file_info['type'],
                        content=content[:100]  # Первые 100 символов для сравнения
                    ).first()
                    
                    if existing_task:
                        continue  # Пропускаем дубликаты
                    
                    # Создаем новое задание
                    task = Task.objects.create(
                        subject=russian_subject,
                        type=file_info['type'],
                        difficulty=file_info['difficulty'],
                        content=content,
                        correct_answer=correct_answer,
                        is_active=True
                    )
                    
                    imported_count += 1
                    
                    if imported_count % 10 == 0:
                        print(f"   ✅ Импортировано {imported_count} заданий...")
                        
                except Exception as e:
                    print(f"   ⚠️  Ошибка при импорте строки {index}: {e}")
                    continue
            
            print(f"   ✅ Успешно импортировано {imported_count} заданий из {file_info['filename']}")
            total_imported += imported_count
            
        except Exception as e:
            print(f"   ❌ Ошибка при обработке файла {file_info['filename']}: {e}")
            continue
    
    print(f"\n🎉 Импорт завершен! Всего импортировано {total_imported} заданий")
    
    # Показываем статистику
    print(f"\n📊 Статистика по базе данных:")
    print(f"   Всего заданий: {Task.objects.count()}")
    print(f"   Заданий по русскому языку: {Task.objects.filter(subject=russian_subject).count()}")
    
    # Показываем распределение по типам
    type_stats = Task.objects.filter(subject=russian_subject).values('type').annotate(
        count=django.db.models.Count('task_id')
    ).order_by('type')
    
    print(f"   Распределение по типам:")
    for stat in type_stats:
        print(f"     {stat['type']}: {stat['count']} заданий")

if __name__ == '__main__':
    print("🚀 Начинаю импорт заданий по русскому языку...")
    import_russian_tasks()
