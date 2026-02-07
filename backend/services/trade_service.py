from backend.services.indian_market_service import IndianMarketService
from backend.models.trade import Trade
from backend.utils.notification_builder import build_trade_notification


class TradingService:
    def __init__(self, portfolio_service, notification_service=None):
        self.portfolio_service = portfolio_service
        self.notification_service = notification_service

    def buy_stock(self, username, symbol, quantity):
        portfolio = self.portfolio_service.get_portfolio(username)

        stock = IndianMarketService.get_stock(symbol)
        if stock is None:
            raise ValueError(f"Failed to fetch stock data for {symbol}")

        current_price = stock.get("price")
        if current_price is None:
            raise ValueError(f"Invalid price data for {symbol}")

        if quantity <= 0:
            raise ValueError("Quantity must be greater than 0")

        total_cost = current_price * quantity

        if portfolio.cash_balance < total_cost:
            raise ValueError("Insufficient balance")

        # Update portfolio
        portfolio.cash_balance -= total_cost
        self.portfolio_service.add_stock(username, symbol, quantity, current_price)

        trade = Trade(username, symbol, quantity, current_price, "BUY")

        # 🔔 SNS NOTIFICATION
        if self.notification_service:
            message = build_trade_notification(
                username=username,
                symbol=symbol,
                quantity=quantity,
                price=current_price,
                trade_type="BUY"
            )
            self.notification_service.publish(message)

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

        # Update portfolio
        self.portfolio_service.remove_stock(username, symbol, quantity)
        total_gain = current_price * quantity
        portfolio.cash_balance += total_gain

        trade = Trade(username, symbol, quantity, current_price, "SELL")

        # 🔔 SNS NOTIFICATION
        if self.notification_service:
            message = build_trade_notification(
                username=username,
                symbol=symbol,
                quantity=quantity,
                price=current_price,
                trade_type="SELL"
            )
            self.notification_service.publish(message)

        return {
            "message": "Stock sold",
            "trade": trade.to_dict()
        }