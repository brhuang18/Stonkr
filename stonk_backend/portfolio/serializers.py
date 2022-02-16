from rest_framework import serializers
from portfolio.models import Portfolio

class PortfolioSerializer(serializers.ModelSerializer):
    user_id = serializers.ReadOnlyField(source='user_id.username')
    class Meta:
        model = Portfolio
        fields = ['id', 'portfolio_name', 'user_id', 'privacy']