from datetime import datetime


class Trade:
    def __init__(self, username, symbol, qty, price, trade_type):
        self.username = username
        self.symbol = symbol.upper()
        self.qty = qty
        self.price = price
        self.trade_type = trade_type
        self.timestamp = datetime.utcnow()

    def to_dict(self):
        return {
            "username": self.username,
            "symbol": self.symbol,
            "qty": self.qty,
            "price": self.price,
            "type": self.trade_type,
            "timestamp": self.timestamp.isoformat()
        }