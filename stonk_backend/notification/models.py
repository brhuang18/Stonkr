from django.db import models
from account.models import Account
from stock.models import Stock 

# Create your models here.
class Notification(models.Model):
    user = models.ForeignKey(Account, on_delete=models.CASCADE)
    stock = models.ForeignKey(Stock, on_delete=models.CASCADE)
    kind = models.CharField(max_length=10)
    value = models.DecimalField(max_digits=19, decimal_places=6)
    current_price = models.DecimalField(max_digits=19, decimal_places=6)
    interval = models.CharField(max_length=6, null=True, blank=True)
    time = models.DateTimeField(null=True)
