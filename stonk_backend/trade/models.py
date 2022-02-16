from django.db import models
from stock.models import Stock
from portfolio.models import Portfolio
# Create your models here.
class Trade(models.Model):
    portfolio = models.ForeignKey(Portfolio, on_delete = models.CASCADE)
    stock = models.ForeignKey(Stock, on_delete = models.CASCADE)
    trade_date = models.DateField()
    order_price = models.DecimalField(max_digits=19, decimal_places=6)
    brokerage_fee = models.DecimalField(max_digits=7, decimal_places=2)
    order_type = models.CharField(max_length = 5)
    quantity = models.DecimalField(max_digits=16, decimal_places=6)
    quantity_left = models.DecimalField(max_digits=16, decimal_places=6, blank=True, null=True)