from django.urls import path
from . import views

app_name = 'content_management'

urlpatterns = [
    path('', views.analytics_dashboard, name='dashboard'),
    path('user-activity/', views.user_activity_chart, name='user_activity'),
    path('task-difficulty/', views.task_difficulty_stats, name='task_difficulty'),
    path('user-progress/', views.user_progress_report, name='user_progress'),
    path('content-performance/', views.content_performance, name='content_performance'),
]
