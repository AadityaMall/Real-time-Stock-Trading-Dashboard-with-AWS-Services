import yfinance as yf
from datetime import datetime
class IndianMarketService:

    @staticmethod
    def get_stock(symbol: str):
        ticker = yf.Ticker(f"{symbol}.NS")

        hist = ticker.history(period="1d")

        if hist.empty:
            raise ValueError("Stock not found")

        last = hist.iloc[-1]

        info = ticker.info

        return {
            "symbol": symbol.upper(),
            "price": float(last["Close"]),
            "open": float(last["Open"]),
            "high": float(last["High"]),
            "low": float(last["Low"]),
            "previous_close": info.get("previousClose"),
            "volume": int(last["Volume"]),
            "market_cap": info.get("marketCap"),
            "currency": info.get("currency", "INR"),
            "timestamp": datetime.utcnow().isoformat()
        }

    @staticmethod
    def get_multiple(symbols: list):
        results = []

        for symbol in symbols:
            try:
                results.append(IndianMarketService.get_stock(symbol))
            except:
                continue

        return results