import requests

from notification.models import Notification
from channels.layers import get_channel_layer
from asgiref.sync import async_to_sync
from datetime import datetime

API_KEY = "HRHSV3RY4TUAZ7QH"

def get_market_price(stock):
    # Get the current market price of the stock
    API_URL = f"https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol={stock}&apikey={API_KEY}"    
    r = requests.get(API_URL)
    quote = r.json()
    market_price = float(quote["Global Quote"]["05. price"])

    return market_price

def send_notification(notification_id):
    notification = Notification.objects.get(id=notification_id)
    channel_layer = get_channel_layer()
    async_to_sync(channel_layer.group_send)(f"notification_{notification.user.id}", {'type': 'notification.triggered', 'notification_id': notification.id})
    notification.time = datetime.now()
    notification.save()