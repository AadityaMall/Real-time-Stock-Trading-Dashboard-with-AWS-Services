from backend.services.indian_market_service import IndianMarketService


class PortfolioService:
    def __init__(self, portfolio_store):
        self.portfolio_store = portfolio_store

    def get_portfolio(self, username):
        return self.portfolio_store.get_or_create(username)

    def add_stock(self, username, symbol, qty, price):
        portfolio = self.get_portfolio(username)

        if symbol not in portfolio.holdings:
            portfolio.holdings[symbol] = {"qty": 0, "avg_price": 0}

        holding = portfolio.holdings[symbol]
        total_cost = holding["qty"] * holding["avg_price"] + qty * price

        holding["qty"] += qty
        holding["avg_price"] = total_cost / holding["qty"]

    def remove_stock(self, username, symbol, qty):
        portfolio = self.get_portfolio(username)

        if symbol not in portfolio.holdings:
            raise ValueError("Stock not owned")

        if portfolio.holdings[symbol]["qty"] < qty:
            raise ValueError("Not enough shares")

        portfolio.holdings[symbol]["qty"] -= qty

        if portfolio.holdings[symbol]["qty"] == 0:
            del portfolio.holdings[symbol]


    def get_full_portfolio_view(self, username):
        portfolio = self.get_portfolio(username)

        symbols = list(portfolio.holdings.keys())

        live_prices = IndianMarketService.get_multiple(symbols) if symbols else []

        price_map = {s["symbol"]: s["price"] for s in live_prices}

        holdings_view = []
        total_invested = 0
        total_current_value = 0

        for symbol, data in portfolio.holdings.items():
            qty = data["qty"]
            avg_price = data["avg_price"]
            live_price = price_map.get(symbol, avg_price)

            invested = qty * avg_price
            current_value = qty * live_price
            pnl = current_value - invested

            total_invested += invested
            total_current_value += current_value

            holdings_view.append({
                "symbol": symbol,
                "quantity": qty,
                "avg_buy_price": avg_price,
                "live_price": live_price,
                "invested_value": invested,
                "current_value": current_value,
                "pnl": pnl
            })

        net_worth = portfolio.cash_balance + total_current_value

        return {
            "username": username,
            "cash_balance": portfolio.cash_balance,
            "total_invested": total_invested,
            "current_holdings_value": total_current_value,
            "net_worth": net_worth,
            "holdings": holdings_view
        }