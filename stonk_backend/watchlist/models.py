from django.db import models
from stock.models import Stock
from account.models import Account

# Create your models here.
class Watchlist(models.Model):
    user = models.ForeignKey(Account, on_delete=models.CASCADE)
    watchlist_name = models.CharField(max_length=50)
    privacy = models.BooleanField(default=True)

class Watchlist_Data(models.Model):
    watchlist = models.ForeignKey(Watchlist, on_delete=models.CASCADE)
    stock = models.ForeignKey(Stock, on_delete=models.CASCADE)