from django.db import models
from account.models import Account

class Portfolio(models.Model):
    portfolio_name = models.CharField(max_length=50)
    user = models.ForeignKey(Account, on_delete=models.CASCADE)
    privacy = models.BooleanField(default=True)