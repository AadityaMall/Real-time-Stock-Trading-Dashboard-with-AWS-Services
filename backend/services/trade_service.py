from services.indian_market_service import IndianMarketService
from models.trade import Trade


class TradingService:
    def __init__(self, portfolio_service):
        self.portfolio_service = portfolio_service

    def buy_stock(self, username, symbol, quantity):
        portfolio = self.portfolio_service.get_portfolio(username)

        stock = IndianMarketService.get_stock(symbol)
        if stock is None:
            raise ValueError(f"Failed to fetch stock data for {symbol}")
        
        current_price = stock.get("price")
        if current_price is None:
            raise ValueError(f"Invalid price data for {symbol}")

        total_cost = current_price * quantity

        if quantity <= 0:
            raise ValueError("Quantity must be greater than 0")

        if portfolio.cash_balance < total_cost:
            raise ValueError("Insufficient balance")

        portfolio.cash_balance -= total_cost

        self.portfolio_service.add_stock(username, symbol, quantity, current_price)

        trade = Trade(username, symbol, quantity, current_price, "BUY")

        return {
            "message": "Stock purchased",
            "trade": trade.to_dict()
        }

    def sell_stock(self, username, symbol, quantity):
        portfolio = self.portfolio_service.get_portfolio(username)

        stock = IndianMarketService.get_stock(symbol)
        if stock is None:
            raise ValueError(f"Failed to fetch stock data for {symbol}")
        
        current_price = stock.get("price")
        if current_price is None:
            raise ValueError(f"Invalid price data for {symbol}")

        if quantity <= 0:
            raise ValueError("Quantity must be greater than 0")

        total_gain = current_price * quantity

        self.portfolio_service.remove_stock(username, symbol, quantity)

        portfolio.cash_balance += total_gain

        trade = Trade(username, symbol, quantity, current_price, "SELL")

        return {
            "message": "Stock sold",
            "trade": trade.to_dict()
        }