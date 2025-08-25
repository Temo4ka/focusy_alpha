from django.shortcuts import render
from django.contrib.admin.views.decorators import staff_member_required
from django.db.models import Count, Q, Avg, Sum
from django.db.models.functions import TruncDate
from django.http import JsonResponse
from datetime import datetime, timedelta
from .models import User, Task, Mission, UserMission, UserTaskAttempt


@staff_member_required
def analytics_dashboard(request):
    """Главная страница аналитики"""
    
    # Общая статистика
    stats = {
        'total_users': User.objects.count(),
        'total_tasks': Task.objects.count(),
        'total_missions': Mission.objects.count(),
        'total_attempts': UserTaskAttempt.objects.count(),
        'active_tasks': Task.objects.filter(is_active=True).count(),
        'completed_missions': UserMission.objects.filter(is_completed=True).count(),
    }

    # Статистика за последние 30 дней
    thirty_days_ago = datetime.now() - timedelta(days=30)
    
    recent_stats = {
        'new_users': User.objects.filter(created_at__gte=thirty_days_ago).count(),
        'recent_attempts': UserTaskAttempt.objects.filter(attempt_time__gte=thirty_days_ago).count(),
        'recent_completions': UserMission.objects.filter(
            completed_at__gte=thirty_days_ago,
            is_completed=True
        ).count(),
    }

    # Топ пользователи по опыту
    top_users = User.objects.order_by('-experience_points')[:10]

    # Статистика по заданиям
    task_stats = Task.objects.annotate(
        attempts_count=Count('usertaskattempt'),
        correct_count=Count('usertaskattempt', filter=Q(usertaskattempt__is_correct=True))
    ).order_by('-attempts_count')[:10]

    # Популярные миссии
    popular_missions = Mission.objects.annotate(
        completions=Count('usermission', filter=Q(usermission__is_completed=True))
    ).order_by('-completions')[:10]

    context = {
        'stats': stats,
        'recent_stats': recent_stats,
        'top_users': top_users,
        'task_stats': task_stats,
        'popular_missions': popular_missions,
    }

    return render(request, 'admin/analytics_dashboard.html', context)


@staff_member_required
def user_activity_chart(request):
    """API для графика активности пользователей"""
    days = int(request.GET.get('days', 30))
    start_date = datetime.now() - timedelta(days=days)
    
    # Группируем регистрации по дням
    registrations = User.objects.filter(
        created_at__gte=start_date
    ).extra(
        select={'day': 'date(created_at)'}
    ).values('day').annotate(
        count=Count('user_id')
    ).order_by('day')
    
    # Группируем попытки по дням
    attempts = UserTaskAttempt.objects.filter(
        attempt_time__gte=start_date
    ).extra(
        select={'day': 'date(attempt_time)'}
    ).values('day').annotate(
        count=Count('attempt_id')
    ).order_by('day')

    data = {
        'registrations': list(registrations),
        'attempts': list(attempts),
    }
    
    return JsonResponse(data)


@staff_member_required
def task_difficulty_stats(request):
    """Статистика по сложности заданий"""
    
    difficulty_stats = []
    for difficulty, label in Task.DIFFICULTY_CHOICES:
        tasks = Task.objects.filter(difficulty=difficulty)
        total_attempts = UserTaskAttempt.objects.filter(task__difficulty=difficulty).count()
        correct_attempts = UserTaskAttempt.objects.filter(
            task__difficulty=difficulty, 
            is_correct=True
        ).count()
        
        success_rate = (correct_attempts / total_attempts * 100) if total_attempts > 0 else 0
        
        difficulty_stats.append({
            'difficulty': difficulty,
            'label': label,
            'task_count': tasks.count(),
            'total_attempts': total_attempts,
            'correct_attempts': correct_attempts,
            'success_rate': round(success_rate, 1)
        })

    return JsonResponse({'difficulty_stats': difficulty_stats})


@staff_member_required
def user_progress_report(request):
    """Отчет по прогрессу пользователей"""
    
    # Пользователи с детальной статистикой
    users_progress = User.objects.annotate(
        total_attempts=Count('usertaskattempt'),
        correct_attempts=Count('usertaskattempt', filter=Q(usertaskattempt__is_correct=True)),
        completed_missions=Count('usermission', filter=Q(usermission__is_completed=True))
    ).order_by('-experience_points')

    context = {
        'users_progress': users_progress,
    }

    return render(request, 'admin/user_progress_report.html', context)


@staff_member_required
def content_performance(request):
    """Анализ производительности контента"""
    
    # Самые сложные задания (низкий процент правильных ответов)
    difficult_tasks = Task.objects.annotate(
        attempts_count=Count('usertaskattempt'),
        correct_count=Count('usertaskattempt', filter=Q(usertaskattempt__is_correct=True))
    ).filter(attempts_count__gte=5).extra(
        select={
            'success_rate': 'CASE WHEN COUNT(content_management_usertaskattempt.attempt_id) > 0 THEN (COUNT(CASE WHEN content_management_usertaskattempt.is_correct = true THEN 1 END) * 100.0 / COUNT(content_management_usertaskattempt.attempt_id)) ELSE 0 END'
        }
    ).order_by('success_rate')[:10]

    # Самые популярные задания
    popular_tasks = Task.objects.annotate(
        attempts_count=Count('usertaskattempt')
    ).filter(attempts_count__gt=0).order_by('-attempts_count')[:10]

    context = {
        'difficult_tasks': difficult_tasks,
        'popular_tasks': popular_tasks,
    }

    return render(request, 'admin/content_performance.html', context)
