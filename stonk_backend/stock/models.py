from django.db import models

# Create your models here.
class Stock(models.Model):
    stock_ticker = models.CharField(max_length = 10, primary_key = True)
    stock_type = models.CharField(max_length = 20)
    stock_name = models.TextField(blank = True, null = True)
    exchange = models.CharField(max_length = 10, blank = True, null = True)
    country = models.CharField(max_length = 50)
    sector = models.CharField(max_length = 100, blank = True, null = True)
    industry = models.CharField(max_length = 100, blank = True, null = True)