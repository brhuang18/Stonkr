import json

from asgiref.sync import async_to_sync
from channels.generic.websocket import WebsocketConsumer

class NotificationsConsumer(WebsocketConsumer):
    def connect(self):
        self.user_id = self.scope['url_route']['kwargs']['user_id']
        self.group_name = 'notification_%s' % self.user_id

        async_to_sync(self.channel_layer.group_add)(
            self.group_name,
            self.channel_name
        )

        self.accept()

    def disconnect(self, close_code):
        async_to_sync(self.channel_layer.group_discard)(
            self.group_name,
            self.channel_name
        )

    def receive(self, text_data):
        pass

    def notification_triggered(self, event):
        self.send(text_data=str(event['notification_id'])) 
    