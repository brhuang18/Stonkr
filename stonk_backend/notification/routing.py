from django.urls import path

from . import consumers

websocket_urlpatterns = [
    path(r'ws/notifications/<int:user_id>/', consumers.NotificationsConsumer.as_asgi()),
]