class User:
    def __init__(self, username, password_hash, balance=100000):
        self.username = username
        self.password_hash = password_hash
        self.balance = balance

    def to_dict(self):
        return {
            "username": self.username,
            "balance": self.balance
        }