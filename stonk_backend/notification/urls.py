from django.urls import path
from notification import views

urlpatterns = [
    path('notification/', views.NotificationCRUD.as_view()),
    path('notifications/', views.get_notifications),
    path('notifications/active/', views.get_active_notifications),
    path('notifications/triggered/', views.get_triggered_notifications),
    path('trigger_notification/', views.trigger_notification)
]