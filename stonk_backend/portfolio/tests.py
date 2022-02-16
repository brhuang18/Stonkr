from django.test import TestCase
from rest_framework.test import APIRequestFactory
from rest_framework.test import force_authenticate
from portfolio.models import Portfolio
from account.models import Account
from trade.models import Trade
from stock.models import Stock
from portfolio.views import PortfolioDetail
from portfolio.helpers import position_info

class PortfolioCRUDTestCase(TestCase):
    def setUp(self):
        self.factory = APIRequestFactory()
        self.user1 = Account.objects.create(username="user1",email="user1@email.com",password="pwd",
        first_name="User",last_name="1")
        self.user2 = Account.objects.create(username="user2",email="user2@email.com",password="pwd",
        first_name="User",last_name="2")
        self.view = PortfolioDetail.as_view()

    def test_authenticated_user_can_create_portfolios(self):
        post_req = self.factory.post('/portfolio/', {'portfolio_name': 'Test Portfolio'})
        force_authenticate(post_req, user=self.user1)
        response = self.view(post_req)
        
        self.assertEqual(response.status_code, 201)
        self.assertEqual(Portfolio.objects.count(), 1)
        self.assertEqual(Portfolio.objects.get().portfolio_name, 'Test Portfolio')

    def test_unauthenticated_user_cant_create_portfolios(self):
        post_req = self.factory.post('/portfolio/', {'portfolio_name': 'Test Portfolio'})
        response = self.view(post_req)
        
        self.assertEqual(response.status_code, 401)
        self.assertEqual(Portfolio.objects.count(), 0)

    def test_only_portfolio_owner_can_rename_portfolio(self):
        portfolio = Portfolio.objects.create(portfolio_name='Test Portfolio', user_id=self.user1.id)

        request = self.factory.put('/portfolio/', {'portfolio_id': portfolio.id, 'portfolio_name': 'Renamed Portfolio'})
        force_authenticate(request, user=self.user1)
        response = self.view(request)
        
        self.assertEqual(response.status_code, 200)
        self.assertEqual(Portfolio.objects.count(), 1)
        self.assertEqual(Portfolio.objects.get().portfolio_name, 'Renamed Portfolio')

        request = self.factory.put('/portfolio/', {'portfolio_id': portfolio.id, 'portfolio_name': 'Failed Portfolio'})
        force_authenticate(request, user=self.user2)
        response = self.view(request)

        self.assertEqual(response.status_code, 403)
        self.assertEqual(Portfolio.objects.get().portfolio_name, 'Renamed Portfolio')

    def test_only_portfolio_owner_can_delete_portfolio(self):
        portfolio = Portfolio.objects.create(portfolio_name='Test Portfolio', user_id=self.user1.id)

        request = self.factory.delete('/portfolio/', {'portfolio_id': portfolio.id})
        force_authenticate(request, user=self.user2)
        response = self.view(request)
        
        self.assertEqual(response.status_code, 403)
        self.assertEqual(Portfolio.objects.count(), 1)

        request = self.factory.delete('/portfolio/', {'portfolio_id': portfolio.id})
        force_authenticate(request, user=self.user1)
        response = self.view(request)
        
        self.assertEqual(response.status_code, 200)
        self.assertEqual(Portfolio.objects.count(), 0)

    def test_cant_create_duplicate_portfolio_name(self):
        portfolio = Portfolio.objects.create(portfolio_name='Test Portfolio', user_id=self.user1.id)

        request = self.factory.post('/portfolio/', {'portfolio_name': 'Test Portfolio'})
        force_authenticate(request, user=self.user1)
        response = self.view(request)
        
        self.assertEqual(response.status_code, 400)
        self.assertEqual(Portfolio.objects.count(), 1)

    def test_cant_rename_to_an_existing_name(self):
        portfolio = Portfolio.objects.create(portfolio_name='Test Portfolio', user_id=self.user1.id)
        portfolio2 = Portfolio.objects.create(portfolio_name='Test Portfolio 2', user_id=self.user1.id)

        request = self.factory.put('/portfolio/', {'portfolio_id': portfolio2.id, 'portfolio_name': 'Test Portfolio'})
        force_authenticate(request, user=self.user1)
        response = self.view(request)
        
        self.assertEqual(response.status_code, 400)

class PositionInfoTest(TestCase):
    def setUp(self):
        self.factory = APIRequestFactory()
        self.user = Account.objects.create(username="user",email="user@email.com",password="pwd",
                                           first_name="User",last_name="Name")
        self.portfolio = Portfolio.objects.create(portfolio_name='Portfolio', user_id=self.user.id)

        self.aapl = Stock.objects.create(stock_ticker="AAPL", stock_type="Ordinary", country="USA")

    def test_no_sell_orders(self):
        Trade.objects.create(portfolio=self.portfolio, stock=self.aapl, trade_date="2020-11-04", 
                             order_price=100, brokerage_fee=10, order_type="B", quantity=10)

        self.assertEqual(position_info(Trade.objects.all()), {'gains_from_sale': 0, 'cost': 1010, 'units': 10})

    def test_one_B_and_one_sell_order(self):
        # Buy orders
        Trade.objects.create(portfolio=self.portfolio, stock=self.aapl, trade_date="2020-11-04", 
                             order_price=100, brokerage_fee=10, order_type="B", quantity=10)
        
        # Sell orders
        Trade.objects.create(portfolio=self.portfolio, stock=self.aapl, trade_date="2020-11-04", 
                             order_price=110, brokerage_fee=10, order_type="S", quantity=5)

        self.assertEqual(position_info(Trade.objects.filter(stock=self.aapl)), {'gains_from_sale': 35, 'cost': 505, 'units': 5})

    def test_orders_on_same_date_sorted_correctly(self):
        Trade.objects.create(portfolio=self.portfolio, stock=self.aapl, trade_date="2020-11-04", 
                             order_price=110, brokerage_fee=10, order_type="S", quantity=5)

        Trade.objects.create(portfolio=self.portfolio, stock=self.aapl, trade_date="2020-11-04", 
                             order_price=100, brokerage_fee=10, order_type="B", quantity=10)

        Trade.objects.create(portfolio=self.portfolio, stock=self.aapl, trade_date="2020-11-04", 
                             order_price=110, brokerage_fee=10, order_type="S", quantity=5)
        
        self.assertEqual(position_info(Trade.objects.filter(stock=self.aapl)), {'gains_from_sale': 70, 'cost': 0, 'units': 0})

    def test_correct_fifo_order(self):
        # Buy orders
        Trade.objects.create(portfolio=self.portfolio, stock=self.aapl, trade_date="2020-11-04", 
                             order_price=100, brokerage_fee=10, order_type="B", quantity=10)
        Trade.objects.create(portfolio=self.portfolio, stock=self.aapl, trade_date="2020-11-05", 
                             order_price=110, brokerage_fee=10, order_type="B", quantity=10)
        
        # Sell orders
        Trade.objects.create(portfolio=self.portfolio, stock=self.aapl, trade_date="2020-11-06", 
                             order_price=120, brokerage_fee=10, order_type="S", quantity=10)

        self.assertEqual(position_info(Trade.objects.filter(stock=self.aapl)), {'gains_from_sale': 180, 'cost': 1110, 'units': 10})

    def test_sell_order_higher_quantity_than_B(self):
        # Buy orders
        Trade.objects.create(portfolio=self.portfolio, stock=self.aapl, trade_date="2020-11-04", 
                             order_price=100, brokerage_fee=10, order_type="B", quantity=10)
        Trade.objects.create(portfolio=self.portfolio, stock=self.aapl, trade_date="2020-11-05", 
                             order_price=110, brokerage_fee=10, order_type="B", quantity=10)
        
        # Sell orders
        Trade.objects.create(portfolio=self.portfolio, stock=self.aapl, trade_date="2020-11-06", 
                             order_price=120, brokerage_fee=10, order_type="S", quantity=15)

        self.assertEqual(position_info(Trade.objects.filter(stock=self.aapl)), {'gains_from_sale': 225, 'cost': 555, 'units': 5})