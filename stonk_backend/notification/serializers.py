from rest_framework import serializers
from notification.models import Notification 

class NotificationSerializer(serializers.ModelSerializer):
    user = serializers.ReadOnlyField(source='user.id')
    class Meta:
        model = Notification 
        fields = ['id', 'user', 'stock', 'kind', 'value', 'interval','current_price', 'time']