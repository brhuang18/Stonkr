from rest_framework import serializers
from watchlist.models import Watchlist, Watchlist_Data

class WatchlistCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Watchlist
        fields = ['user', 'watchlist_name', 'privacy']
    
    def save(self):
        try:
            user = self.validated_data['user']
            watchlist_name = self.validated_data['watchlist_name']
            privacy = self.validated_data['privacy']

            watchlist = Watchlist(
                user = user,
                watchlist_name = watchlist_name,
                privacy = privacy
            )

            watchlist.save()
            return watchlist
        except KeyError:
            raise serializers.ValidationError({"response": "You must have a watchlist_name, user_id, privacy."}) 

class WatchlistUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Watchlist
        fields = ['user','watchlist_name', 'privacy']

class WatchlistViewSerializer(serializers.ModelSerializer):
    class Meta:
        model = Watchlist
        fields = ['id', 'user', 'watchlist_name', 'privacy']

class WatchlistDataCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Watchlist_Data
        fields = ['watchlist', 'stock']

        def save(self):
            try:
                watchlist = self.validated_data['watchlist']
                stock = self.validated_data['stock']

                watchlist_data = Watchlist_Data(
                    watchlist = watchlist,
                    stock = stock
                )

                watchlist_data.save()
                return watchlist_data
            except KeyError:
                raise serializers.ValidationError({"response": "You must have a watchlist_id, stock_id."})