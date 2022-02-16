import requests

from apscheduler.schedulers.background import BackgroundScheduler
from notification.models import Notification
from stock.models import Stock 
from notification.helpers import get_market_price, send_notification
from portfolio.helpers import fetch_quote_data
from channels.layers import get_channel_layer
from asgiref.sync import async_to_sync
from datetime import datetime

def download_and_notify():
    stocks = set(Notification.objects.all().values_list('stock', flat=True))
    stocks = [Stock.objects.get(stock_ticker=s) for s in stocks]

    stock_price = {}
    change_percent = {}

    quote_data = fetch_quote_data(stocks)
    for stock, quote in quote_data.items():
        stock_price[stock] = float(quote["05. price"])
        change_percent[stock] = float(quote["10. change percent"].strip('%'))

    for notification in Notification.objects.filter(time__isnull=True):
        stock = notification.stock.stock_ticker
        value = notification.value
        current_price = notification.current_price

        if notification.kind == 'value':
            if (value >= current_price and stock_price[stock] >= value or 
                value < current_price and stock_price[stock] < value):

                send_notification(notification)
        if notification.kind == 'percentage':
            if abs(change_percent[stock]) >= notification.value:
                send_notification(notification)

def start():
    print('Notification updater started')
    scheduler = BackgroundScheduler()
    scheduler.add_job(download_and_notify, 'interval', minutes=1)
    scheduler.start()