class Portfolio:
    def __init__(self, username, cash_balance=100000):
        self.username = username
        self.cash_balance = cash_balance
        self.holdings = {}

    def to_dict(self):
        return {
            "username": self.username,
            "cash_balance": self.cash_balance,
            "holdings": self.holdings
        }