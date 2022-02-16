from rest_framework import serializers
from trade.models import Trade

class TradeCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Trade
        fields = ['portfolio', 'stock', 'trade_date', 'order_price', 'brokerage_fee', 'order_type', 'quantity']
    
    def save(self):
        try:
            portfolio = self.validated_data['portfolio']
            stock = self.validated_data['stock']
            trade_date = self.validated_data['trade_date']
            order_price = self.validated_data['order_price']
            brokerage_fee = self.validated_data['brokerage_fee']
            order_type = self.validated_data['order_type']
            quantity = self.validated_data['quantity']
            quantity_left = self.validated_data['quantity']

            trade = Trade(
                portfolio = portfolio,
                stock = stock,
                trade_date = trade_date,
                order_price = order_price,
                brokerage_fee = brokerage_fee,
                order_type = order_type,
                quantity = quantity,
                quantity_left = quantity_left
            )

            trade.save()
            return trade
        except KeyError:
            raise serializers.ValidationError({"response": "You must have a portfolio, stock, trade_date, order_price, brokerage_fee, order_type, and quantity"}) 

class TradeUpdateSerializer(serializers.ModelSerializer):
     class Meta:
        model = Trade
        fields = ['portfolio', 'stock', 'trade_date', 'order_price', 'brokerage_fee', 'order_type', 'quantity', 'quantity_left']

    #  def validate(self, trade):
    #     try:
    #         portfolio = trade['portfolio']
    #         stock = trade['stock']
    #         trade_date = trade['trade_date']
    #         order_price = trade['order_price']
    #         brokerage_fee = trade['brokerage_fee']
    #         order_type = trade['order_type']
    #         quantity = trade['quantity']
    #         quantity_left = trade['quantity']
    #     except KeyError:
    #         raise serializers.ValidationError({"response": "You must have a valid portfolio, stock, trade_date, order_price, brokerage_fee, order_type, and quantity"}) 
    #     return trade 

class TradeViewSerializer(serializers.ModelSerializer):
    class Meta:
        model = Trade
        fields = ['id', 'portfolio', 'stock', 'trade_date', 'order_price', 'brokerage_fee', 'order_type', 'quantity']