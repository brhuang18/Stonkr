from rest_framework import serializers
from user.models import Followed_Watchlist_Data, Followed_Portfolio_Data

class FollowedWatchlistDataCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Followed_Watchlist_Data
        fields = ['user', 'watchlist']

        def save(self):
            try:
                user = self.validated_data['user']
                watchlist = self.validated_data['watchlist']

                followed_watchlist_data = Followed_Watchlist_Data(
                    user = user,
                    watchlist = watchlist,
                )

                followed_watchlist_data.save()
                return followed_watchlist_data
            except KeyError:
                raise serializers.ValidationError({"response": "You must have a user_id, watchlist_id."})

class FollowedPortfolioDataCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Followed_Portfolio_Data
        fields = ['user', 'portfolio']

        def save(self):
            try:
                user = self.validated_data['user']
                portfolio = self.validated_data['portfolio']

                followed_portfolio_data = Followed_Portfolio_Data(
                    user = user,
                    portfolio = portfolio,
                )

                followed_portfolio_data.save()
                return followed_portfolio_data
            except KeyError:
                raise serializers.ValidationError({"response": "You must have a user_id, portfolio_id."})