from django.db import models
from account.models import Account
from watchlist.models import Watchlist
from portfolio.models import Portfolio

# Create your models here.
class Followed_Watchlist_Data(models.Model):
    user = models.ForeignKey(Account, on_delete=models.CASCADE)
    watchlist = models.ForeignKey(Watchlist, on_delete=models.CASCADE)

class Followed_Portfolio_Data(models.Model):
    user = models.ForeignKey(Account, on_delete=models.CASCADE)
    portfolio = models.ForeignKey(Portfolio, on_delete=models.CASCADE)
