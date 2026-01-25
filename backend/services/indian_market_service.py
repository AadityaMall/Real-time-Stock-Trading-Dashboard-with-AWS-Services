import requests
from conifg import settings


class PriceService:
    BASE_URL = "https://www.alphavantage.co/query"

    @staticmethod
    def get_stock_price(symbol: str) -> float:
        params = {
            "function": "GLOBAL_QUOTE",
            "symbol": symbol,
            "apikey": settings.ALPHAVANTAGE_API_KEY
        }

        response = requests.get(PriceService.BASE_URL, params=params)
        data = response.json()

        if "Global Quote" not in data or not data["Global Quote"]:
            raise ValueError("Invalid symbol or API limit reached")

        price = float(data["Global Quote"]["05. price"])
        return price