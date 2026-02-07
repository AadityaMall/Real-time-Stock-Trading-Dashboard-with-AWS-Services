from backend.models.portfolio import Portfolio


class PortfolioStore:
    def __init__(self):
        self.portfolios = {}  # username → Portfolio

    def get_or_create(self, username):
        if username not in self.portfolios:
            self.portfolios[username] = Portfolio(username)
        return self.portfolios[username]