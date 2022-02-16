from django.test import TestCase
from rest_framework.test import APITestCase, APIClient
from rest_framework.test import force_authenticate
from rest_framework import status
from portfolio.models import Portfolio
from account.models import Account
from trade.models import Trade
from stock.models import Stock
from trade.views import(
    create_trade_view,
    delete_trade_view,
    update_trade_view,
    trade_stock_view,
    trade_portfolio_view,
)

# Create your tests here.
class TradeCRUDTestCase(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.user1 = Account.objects.create(username="user",email="user@email.com",password="pwd",
                                           first_name="User",last_name="Name")
        self.portfolio = Portfolio.objects.create(portfolio_name='Portfolio', user_id=self.user1.id)

        self.aapl = Stock.objects.create(stock_ticker="AAPL", stock_type="Ordinary", country="USA")

    def test_authenticated_user_can_create_trade(self):
        post_req = '/trade/add_trade/'
        
        post_dict = {'portfolio': self.portfolio.id,
        'stock': self.aapl.stock_ticker,
        'trade_date': '2020-11-04',
        'order_price': 100,
        'brokerage_fee': 10,
        'order_type': 'B',
        'quantity': 100}
        self.client.force_authenticate(self.user1)
        response = self.client.post(post_req, post_dict)
        
        self.assertEqual(response.status_code, 201)
        self.assertEqual(Trade.objects.count(), 1)
        self.assertEqual(Trade.objects.get().quantity, 100)

    def test_unauthenticated_user_cant_create_trades(self):
        post_req = '/trade/add_trade/'
        
        post_dict = {'portfolio': self.portfolio.id,
        'stock': self.aapl.stock_ticker,
        'trade_date': '2020-11-04',
        'order_price': 100,
        'brokerage_fee': 10,
        'order_type': 'B',
        'quantity': 100}
        response = self.client.post(post_req, post_dict)
        
        self.assertEqual(response.status_code, 401)
        self.assertEqual(Trade.objects.count(), 0)
    
    def test_different_account_cant_create_trades(self):
        post_req = '/trade/add_trade/'
        user2 = Account.objects.create(username="user2",email="user2@email.com",password="pwd",
                                           first_name="User",last_name="Name")

        tmp_portfolio = Portfolio.objects.create(portfolio_name='Portfolio', user_id=user2.id)
        post_dict = {'portfolio': tmp_portfolio.id,
        'stock': self.aapl.stock_ticker,
        'trade_date': '2020-11-04',
        'order_price': 100,
        'brokerage_fee': 10,
        'order_type': 'B',
        'quantity': 100}
        self.client.force_authenticate(self.user1)
        response = self.client.post(post_req, post_dict)
        
        self.assertEqual(response.status_code, 403)
        self.assertEqual(Trade.objects.count(), 0)

    def test_too_many_sell_create_trades(self):
        self.client.force_authenticate(self.user1)

        # post_req = '/trade/add_trade/'
        # post_dict = {'portfolio': self.portfolio.id,
        # 'stock': self.aapl.stock_ticker,
        # 'trade_date': '2020-11-04',
        # 'order_price': 100,
        # 'brokerage_fee': 10,
        # 'order_type': 'B',
        # 'quantity': 100}
        # response = self.client.post(post_req, post_dict)
        # self.assertEqual(response.status_code, 201)
        # self.assertEqual(Trade.objects.count(), 1)

        tmp_trade = Trade.objects.create(portfolio=self.portfolio, stock=self.aapl, trade_date="2020-11-04", 
        order_price=100, brokerage_fee=10, order_type="B", quantity=199)
        self.assertEqual(Trade.objects.count(), 1)

        post_req = '/trade/add_trade/'
        post_dict = {'portfolio': self.portfolio.id,
        'stock': self.aapl.stock_ticker,
        'trade_date': '2020-11-04',
        'order_price': 100,
        'brokerage_fee': 10,
        'order_type': 'S',
        'quantity': 200}
        response = self.client.post(post_req, post_dict)
        
        self.assertEqual(response.status_code, 400)
        self.assertEqual(Trade.objects.count(), 1)

    def test_trade_owner_can_delete_trade(self):
        self.client.force_authenticate(self.user1)

        tmp_trade = Trade.objects.create(portfolio=self.portfolio, stock=self.aapl, trade_date="2020-11-04", 
        order_price=100, brokerage_fee=10, order_type="B", quantity=10)
        self.assertEqual(Trade.objects.count(), 1)


        post_req = '/trade/delete_trade/'
        post_dict = {'trade_id': tmp_trade.id}
        response = self.client.delete(post_req, post_dict)
        self.assertEqual(response.status_code, 200)
        self.assertEqual(Trade.objects.count(), 0)

    def test_trade_nonowner_cant_delete_trade(self):

        tmp_trade = Trade.objects.create(portfolio=self.portfolio, stock=self.aapl, trade_date="2020-11-04", 
        order_price=100, brokerage_fee=10, order_type="B", quantity=10)
        self.assertEqual(Trade.objects.count(), 1)

        user2 = Account.objects.create(username="user2",email="user2@email.com",password="pwd",
                first_name="User2",last_name="Name")

        self.client.force_authenticate(user2)
        post_req = '/trade/delete_trade/'
        post_dict = {'trade_id': tmp_trade.id}
        response = self.client.delete(post_req, post_dict)
        self.assertEqual(response.status_code, 403)
        self.assertEqual(Trade.objects.count(), 1)
    
    def test_unauthenticated_user_cant_delete_trade(self):
        tmp_trade = Trade.objects.create(portfolio=self.portfolio, stock=self.aapl, trade_date="2020-11-04", 
        order_price=100, brokerage_fee=10, order_type="B", quantity=10)
        self.assertEqual(Trade.objects.count(), 1)


        post_req = '/trade/delete_trade/'
        post_dict = {'trade_id': tmp_trade.id}
        response = self.client.delete(post_req, post_dict)
        self.assertEqual(response.status_code, 401)
        self.assertEqual(Trade.objects.count(), 1)

    def test_cant_delete_unexisting_trade(self):
        self.client.force_authenticate(self.user1)
        post_req = '/trade/delete_trade/'
        post_dict = {'trade_id': 100}
        response = self.client.delete(post_req, post_dict)
        self.assertEqual(response.status_code, 404)
        self.assertEqual(Trade.objects.count(), 0)
    
    def test_trade_owner_can_update(self):
        self.client.force_authenticate(self.user1)

        tmp_trade = Trade.objects.create(portfolio=self.portfolio, stock=self.aapl, trade_date="2020-11-04", 
        order_price=100, brokerage_fee=10, order_type="B", quantity=10)
        tmp_portfolio = Portfolio.objects.create(portfolio_name='Portfolio', user_id=self.user1.id)
        fb = Stock.objects.create(stock_ticker="FB", stock_type="Ordinary", country="USA")
        self.assertEqual(Trade.objects.count(), 1)


        post_req = '/trade/edit_trade/'
        post_dict = {'trade_id': tmp_trade.id, 'portfolio' : tmp_portfolio.id, 'stock' : fb.stock_ticker,
        'trade_date' : "2021-11-04", "order_price" : 50, "brokerage_fee" : 20, "order_type" : "B", 
        "quantity" : 100, "quantity_left" : 100}
        
        response = self.client.put(post_req, post_dict)
        self.assertEqual(response.status_code, 200)
        self.assertEqual(Trade.objects.count(), 1)
        self.assertEqual(Trade.objects.get().id, tmp_trade.id)
        self.assertEqual(Trade.objects.get().portfolio.id, tmp_portfolio.id)
        self.assertEqual(Trade.objects.get().stock.stock_ticker, fb.stock_ticker)
        self.assertEqual(str(Trade.objects.get().trade_date), "2021-11-04")
        self.assertEqual(Trade.objects.get().order_price, 50)
        self.assertEqual(Trade.objects.get().brokerage_fee, 20)
        self.assertEqual(Trade.objects.get().order_type, "B")
        self.assertEqual(Trade.objects.get().quantity, 100)
        self.assertEqual(Trade.objects.get().quantity_left, 100)

    def test_trade_owner_can_update_without_fields(self):
        self.client.force_authenticate(self.user1)

        tmp_trade = Trade.objects.create(portfolio=self.portfolio, stock=self.aapl, trade_date="2020-11-04", 
        order_price=100, brokerage_fee=10, order_type="B", quantity=10, quantity_left = 10)
        self.assertEqual(Trade.objects.count(), 1)


        post_req = '/trade/edit_trade/'
        post_dict = {'trade_id': tmp_trade.id}
        
        response = self.client.put(post_req, post_dict)
        self.assertEqual(response.status_code, 200)
        self.assertEqual(Trade.objects.count(), 1)
        self.assertEqual(Trade.objects.get().id, tmp_trade.id)
        self.assertEqual(Trade.objects.get().portfolio.id, self.portfolio.id)
        self.assertEqual(Trade.objects.get().stock.stock_ticker, self.aapl.stock_ticker)
        self.assertEqual(str(Trade.objects.get().trade_date), "2020-11-04")
        self.assertEqual(Trade.objects.get().order_price, 100)
        self.assertEqual(Trade.objects.get().brokerage_fee, 10)
        self.assertEqual(Trade.objects.get().order_type, "B")
        self.assertEqual(Trade.objects.get().quantity, 10)
        self.assertEqual(Trade.objects.get().quantity_left, 10)

    def test_trade_doesnt_exist_update(self):
        self.client.force_authenticate(self.user1)

        tmp_trade = Trade.objects.create(portfolio=self.portfolio, stock=self.aapl, trade_date="2020-11-04", 
        order_price=100, brokerage_fee=10, order_type="B", quantity=10, quantity_left = 10)
        self.assertEqual(Trade.objects.count(), 1)


        post_req = '/trade/edit_trade/'
        post_dict = {'trade_id': 100}
        
        response = self.client.put(post_req, post_dict)
        self.assertEqual(response.status_code, 404)
        self.assertEqual(Trade.objects.count(), 1)
    
    def test_trade_nonowner_cant_update(self):
        user2 = Account.objects.create(username="user2",email="user2@email.com",password="pwd",
                                           first_name="User",last_name="Name")
        tmp_trade = Trade.objects.create(portfolio=self.portfolio, stock=self.aapl, trade_date="2020-11-04", 
        order_price=100, brokerage_fee=10, order_type="B", quantity=10, quantity_left = 10)
        self.assertEqual(Trade.objects.count(), 1)

        self.client.force_authenticate(user2)

        post_req = '/trade/edit_trade/'
        post_dict = {'trade_id': tmp_trade.id}
        
        response = self.client.put(post_req, post_dict)
        self.assertEqual(response.status_code, 403)
        self.assertEqual(Trade.objects.count(), 1)
    
    def test_trade_nonowner_cant_move_portfolio(self):
        user2 = Account.objects.create(username="user2",email="user2@email.com",password="pwd",
                                           first_name="User",last_name="Name")
        tmp_trade = Trade.objects.create(portfolio=self.portfolio, stock=self.aapl, trade_date="2020-11-04", 
        order_price=100, brokerage_fee=10, order_type="B", quantity=10, quantity_left = 10)
        tmp_portfolio = Portfolio.objects.create(portfolio_name='Portfolio', user_id=user2.id)
        
        self.client.force_authenticate(self.user1)

        post_req = '/trade/edit_trade/'
        post_dict = {'trade_id': tmp_trade.id, 'portfolio' : tmp_portfolio.id}
        
        response = self.client.put(post_req, post_dict)
        self.assertEqual(response.status_code, 403)
        self.assertEqual(Trade.objects.count(), 1)
    
    def test_trade_sells_exceed_buy(self):
        self.client.force_authenticate(self.user1)

        tmp_trade = Trade.objects.create(portfolio=self.portfolio, stock=self.aapl, trade_date="2020-11-04", 
        order_price=100, brokerage_fee=10, order_type="B", quantity=10)
        
        tmp_trade2 = Trade.objects.create(portfolio=self.portfolio, stock=self.aapl, trade_date="2020-11-04", 
        order_price=100, brokerage_fee=10, order_type="B", quantity=11)

        post_req = '/trade/edit_trade/'
        post_dict = {'trade_id': tmp_trade2.id, "order_type" : "S"}
        
        response = self.client.put(post_req, post_dict)
        self.assertEqual(response.status_code, 400)
    
    def test_get_trades_for_stock(self):
        self.client.force_authenticate(self.user1)

        tmp_trade = Trade.objects.create(portfolio=self.portfolio, stock=self.aapl, trade_date="2020-11-04", 
        order_price=100, brokerage_fee=10, order_type="B", quantity=10)
        
        tmp_trade2 = Trade.objects.create(portfolio=self.portfolio, stock=self.aapl, trade_date="2020-11-04", 
        order_price=100, brokerage_fee=10, order_type="B", quantity=11)

        fb = Stock.objects.create(stock_ticker="FB", stock_type="Ordinary", country="USA")

        tmp_trade3 = Trade.objects.create(portfolio=self.portfolio, stock=fb, trade_date="2020-11-04", 
        order_price=100, brokerage_fee=10, order_type="B", quantity=100)
        

        post_req = '/trade/holdings/get_trades/'
        post_dict = {'trade_id': tmp_trade2.id, "portfolio_id" : self.portfolio.id, 
        "stock_ticker" : self.aapl.stock_ticker}
        
        response = self.client.get(post_req, post_dict)
        self.assertEqual(response.status_code, 200)
        self.assertEqual(len(response.data["trades"]), 2)

    def test_get_trades_for_stock_doesnt_exist(self):
        self.client.force_authenticate(self.user1)

        tmp_trade = Trade.objects.create(portfolio=self.portfolio, stock=self.aapl, trade_date="2020-11-04", 
        order_price=100, brokerage_fee=10, order_type="B", quantity=10)
        
        tmp_trade2 = Trade.objects.create(portfolio=self.portfolio, stock=self.aapl, trade_date="2020-11-04", 
        order_price=100, brokerage_fee=10, order_type="B", quantity=11)
        
        post_req = '/trade/holdings/get_trades/'
        post_dict = {'trade_id': tmp_trade2.id, "portfolio_id" : self.portfolio.id, 
        "stock_ticker" : "ansdioansdoin"}
        
        response = self.client.get(post_req, post_dict)
        self.assertEqual(response.status_code, 404)
    
    def test_get_trades_for_stock_portfolio_doesnt_exist(self):
        self.client.force_authenticate(self.user1)

        tmp_trade = Trade.objects.create(portfolio=self.portfolio, stock=self.aapl, trade_date="2020-11-04", 
        order_price=100, brokerage_fee=10, order_type="B", quantity=10)
        
        tmp_trade2 = Trade.objects.create(portfolio=self.portfolio, stock=self.aapl, trade_date="2020-11-04", 
        order_price=100, brokerage_fee=10, order_type="B", quantity=11)
        
        post_req = '/trade/holdings/get_trades/'
        post_dict = {'trade_id': tmp_trade2.id, "portfolio_id" : 100, 
        "stock_ticker" : self.aapl.stock_ticker}
        
        response = self.client.get(post_req, post_dict)
        self.assertEqual(response.status_code, 404)

    def test_get_trades_for_stock_no_permission(self):
        self.client.force_authenticate(self.user1)

        user2 = Account.objects.create(username="user2",email="user2@email.com",password="pwd",
                                           first_name="User",last_name="Name")
        tmp_portfolio = Portfolio.objects.create(portfolio_name='Portfolio', user_id=user2.id, privacy = True)

        tmp_trade = Trade.objects.create(portfolio=tmp_portfolio, stock=self.aapl, trade_date="2020-11-04", 
        order_price=100, brokerage_fee=10, order_type="B", quantity=10)
        
        tmp_trade2 = Trade.objects.create(portfolio=tmp_portfolio, stock=self.aapl, trade_date="2020-11-04", 
        order_price=100, brokerage_fee=10, order_type="B", quantity=11)
        
        
        post_req = '/trade/holdings/get_trades/'
        post_dict = {'trade_id': tmp_trade2.id, "portfolio_id" : tmp_portfolio.id, 
        "stock_ticker" : self.aapl.stock_ticker}
        
        response = self.client.get(post_req, post_dict)
        self.assertEqual(response.status_code, 403)

    def test_get_trades_for_stock_yes_permission(self):
        self.client.force_authenticate(self.user1)

        user2 = Account.objects.create(username="user2",email="user2@email.com",password="pwd",
                                           first_name="User",last_name="Name")
        tmp_portfolio = Portfolio.objects.create(portfolio_name='Portfolio', user_id=user2.id, privacy = False)

        tmp_trade = Trade.objects.create(portfolio=tmp_portfolio, stock=self.aapl, trade_date="2020-11-04", 
        order_price=100, brokerage_fee=10, order_type="B", quantity=10)
        
        tmp_trade2 = Trade.objects.create(portfolio=tmp_portfolio, stock=self.aapl, trade_date="2020-11-04", 
        order_price=100, brokerage_fee=10, order_type="B", quantity=11)
        
        
        post_req = '/trade/holdings/get_trades/'
        post_dict = {'trade_id': tmp_trade2.id, "portfolio_id" : tmp_portfolio.id, 
        "stock_ticker" : self.aapl.stock_ticker}
        
        response = self.client.get(post_req, post_dict)
        self.assertEqual(response.status_code, 200)
        self.assertEqual(len(response.data["trades"]), 2)

    def test_get_trades_for_portfolios(self):
        self.client.force_authenticate(self.user1)

        tmp_trade = Trade.objects.create(portfolio=self.portfolio, stock=self.aapl, trade_date="2020-11-04", 
        order_price=100, brokerage_fee=10, order_type="B", quantity=10)
        
        tmp_trade2 = Trade.objects.create(portfolio=self.portfolio, stock=self.aapl, trade_date="2020-11-04", 
        order_price=100, brokerage_fee=10, order_type="B", quantity=11)

        fb = Stock.objects.create(stock_ticker="FB", stock_type="Ordinary", country="USA")

        tmp_trade3 = Trade.objects.create(portfolio=self.portfolio, stock=fb, trade_date="2020-11-04", 
        order_price=100, brokerage_fee=10, order_type="B", quantity=100)
        

        post_req = '/trade/get_trades/'
        post_dict = {'trade_id': tmp_trade2.id, "portfolio_id" : self.portfolio.id}
        
        response = self.client.get(post_req, post_dict)
        self.assertEqual(response.status_code, 200)
        self.assertEqual(len(response.data["trades"]), 3)

    def test_get_trades_for_portfolios_doesnt_exist(self):
        self.client.force_authenticate(self.user1)

        tmp_trade = Trade.objects.create(portfolio=self.portfolio, stock=self.aapl, trade_date="2020-11-04", 
        order_price=100, brokerage_fee=10, order_type="B", quantity=10)
        
        tmp_trade2 = Trade.objects.create(portfolio=self.portfolio, stock=self.aapl, trade_date="2020-11-04", 
        order_price=100, brokerage_fee=10, order_type="B", quantity=11)
        
        post_req = '/trade/get_trades/'
        post_dict = {'trade_id': tmp_trade2.id, "portfolio_id" : 100}
        
        response = self.client.get(post_req, post_dict)
        self.assertEqual(response.status_code, 404)

    def test_get_trades_for_portfolios_no_permission(self):
        self.client.force_authenticate(self.user1)

        user2 = Account.objects.create(username="user2",email="user2@email.com",password="pwd",
                                           first_name="User",last_name="Name")
        tmp_portfolio = Portfolio.objects.create(portfolio_name='Portfolio', user_id=user2.id, privacy = True)

        tmp_trade = Trade.objects.create(portfolio=tmp_portfolio, stock=self.aapl, trade_date="2020-11-04", 
        order_price=100, brokerage_fee=10, order_type="B", quantity=10)
        
        tmp_trade2 = Trade.objects.create(portfolio=tmp_portfolio, stock=self.aapl, trade_date="2020-11-04", 
        order_price=100, brokerage_fee=10, order_type="B", quantity=11)
        
        
        post_req = '/trade/get_trades/'
        post_dict = {'trade_id': tmp_trade2.id, "portfolio_id" : tmp_portfolio.id}
        
        response = self.client.get(post_req, post_dict)
        self.assertEqual(response.status_code, 403)

    def test_get_trades_for_portfolios_yes_permission(self):
        self.client.force_authenticate(self.user1)

        user2 = Account.objects.create(username="user2",email="user2@email.com",password="pwd",
                                           first_name="User",last_name="Name")
        tmp_portfolio = Portfolio.objects.create(portfolio_name='Portfolio', user_id=user2.id, privacy = False)

        tmp_trade = Trade.objects.create(portfolio=tmp_portfolio, stock=self.aapl, trade_date="2020-11-04", 
        order_price=100, brokerage_fee=10, order_type="B", quantity=10)
        
        tmp_trade2 = Trade.objects.create(portfolio=tmp_portfolio, stock=self.aapl, trade_date="2020-11-04", 
        order_price=100, brokerage_fee=10, order_type="B", quantity=11)
        
        
        post_req = '/trade/get_trades/'
        post_dict = {'trade_id': tmp_trade2.id, "portfolio_id" : tmp_portfolio.id}
        
        response = self.client.get(post_req, post_dict)
        self.assertEqual(response.status_code, 200)
        self.assertEqual(len(response.data["trades"]), 2)