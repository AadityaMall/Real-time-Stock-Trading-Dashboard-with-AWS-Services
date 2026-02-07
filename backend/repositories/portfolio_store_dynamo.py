from backend.aws.aws_client import AWSClientFactory
from backend.models.portfolio import Portfolio


class PortfolioStoreDynamo:
    def __init__(self, table_name="Portfolios"):
        self.table = AWSClientFactory.dynamodb().Table(table_name)

    def get_or_create(self, username):
        res = self.table.get_item(Key={"username": username})
        item = res.get("Item")

        if not item:
            portfolio = Portfolio(username)
            self.save(portfolio)
            return portfolio

        portfolio = Portfolio(
            username=item["username"],
            cash_balance=item["cash_balance"]
        )
        portfolio.holdings = item.get("holdings", {})
        return portfolio

    def save(self, portfolio: Portfolio):
        self.table.put_item(
            Item={
                "username": portfolio.username,
                "cash_balance": portfolio.cash_balance,
                "holdings": portfolio.holdings
            }
        )