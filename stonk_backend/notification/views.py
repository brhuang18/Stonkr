from django.shortcuts import render

from notification.models import Notification 
from stock.models import Stock
from notification.serializers import NotificationSerializer 
from django.http import Http404
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from notification.permissions import IsOwner
from rest_framework.authentication import TokenAuthentication
from rest_framework import generics
from rest_framework.decorators import api_view, authentication_classes, permission_classes
from notification.helpers import get_market_price, send_notification

def get_notification(notification_id):
    """
    Return the Notification object corresponding to the notification_id
    """
    try:
        notification = Notification.objects.get(id=notification_id)
        return notification 
    except Notification.DoesNotExist:
        raise Http404

class NotificationCRUD(generics.GenericAPIView):
    """
    Create, edit, delete notification 
    """

    permission_classes = (IsAuthenticated, IsOwner,) 
    authentication_classes = (TokenAuthentication,) 

    def get_notification(self, notification_id):
        notification = get_notification(notification_id)
        self.check_object_permissions(self.request, notification)
        return notification 

    def post(self, request):
        # Check if there are any other notifications with this name
        data = request.data.copy()
        data['current_price'] = get_market_price(data['stock'])

        if data['kind'] not in ['percentage', 'value']:
            return Response({"response": "invalid notification type"}, status=status.HTTP_400_BAD_REQUEST)
        
        serializer = NotificationSerializer(data=data)
        if serializer.is_valid():
            serializer.save(user=self.request.user)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def get(self, request):
        notification_id = request.GET.get('notification_id')
        notification = self.get_notification(notification_id)
        serializer = NotificationSerializer(notification)
        return Response(serializer.data, status=status.HTTP_200_OK)

    def put(self, request):
        notification_id = request.data.get('notification_id')
        notification = self.get_notification(notification_id)

        stock = request.data.get('stock')
        kind = request.data.get('kind')
        interval = request.data.get('interval')
        value = request.data.get('value')

        if stock:
            stock_object = Stock.objects.get(stock_ticker=stock)
            if stock_object:
                notification.stock = stock_object
            else:
                return Response({'response': 'invalid stock'}, status=status.HTTP_400_BAD_REQUEST)
        if kind:
            if kind in ['percentage', 'value']:
                notification.kind = kind 
            else:
                return Response({'response': 'kind must be value or percentage'}, status=status.HTTP_400_BAD_REQUEST)
        if interval:
            if interval in ['hourly', 'daily']:
                notification.interval = interval 
            else:
                return Response({'response': 'interval must be hourly or daily'}, status=status.HTTP_400_BAD_REQUEST)
        if value:
            notification.value = value

        notification.save()

        serializer = NotificationSerializer(notification)
        return Response(serializer.data, status=status.HTTP_200_OK)

        
    def delete(self, request):
        notification_id = request.data.get('notification_id')
        notification = self.get_notification(notification_id)
        notification.delete()

        return Response(status=status.HTTP_200_OK)

@api_view(['GET', ])
@permission_classes([IsAuthenticated,])
@authentication_classes([TokenAuthentication,])
def get_notifications(request):
    user_notifications = Notification.objects.filter(user=request.user)
    serializer = NotificationSerializer(user_notifications, many=True)
    return Response(serializer.data, status=status.HTTP_200_OK)
    
@api_view(['GET', ])
@permission_classes([IsAuthenticated,])
@authentication_classes([TokenAuthentication,])
def get_triggered_notifications(request):
    user_notifications = Notification.objects.filter(user=request.user).exclude(time__isnull=True)
    serializer = NotificationSerializer(user_notifications, many=True)
    return Response(serializer.data, status=status.HTTP_200_OK)

@api_view(['GET', ])
@permission_classes([IsAuthenticated,])
@authentication_classes([TokenAuthentication,])
def get_active_notifications(request):
    user_notifications = Notification.objects.filter(user=request.user).filter(time__isnull=True)
    serializer = NotificationSerializer(user_notifications, many=True)
    return Response(serializer.data, status=status.HTTP_200_OK)

@api_view(['POST', ])
@permission_classes([])
@authentication_classes([])
def trigger_notification(request):
    notification_id = request.data.get('notification_id')
    send_notification(notification_id)
    return Response(status=status.HTTP_200_OK)