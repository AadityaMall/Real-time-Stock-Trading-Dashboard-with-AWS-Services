import yfinance as yf
from datetime import datetime
import math
class IndianMarketService:

    @staticmethod
    def get_stock(symbol: str):
        try:
            ticker = yf.Ticker(f"{symbol}.NS")

            hist = ticker.history(period="5d")

            if hist.empty:
                raise ValueError(f"Stock {symbol} not found or no data available")

            last = hist.iloc[-1]

            # Get info, handle case where it might be None
            info = ticker.info
            if info is None:
                info = {}

            # Ensure we have valid price data
            close_price = last["Close"]
            if close_price is None or (isinstance(close_price, float) and (math.isnan(close_price) or math.isinf(close_price))):
                raise ValueError(f"Invalid price data for {symbol}")

            volume = last["Volume"]
            if volume is None or (isinstance(volume, float) and math.isnan(volume)):
                volume = 0

            return {
                "symbol": symbol.upper(),
                "price": float(close_price),
                "open": float(last["Open"]),
                "high": float(last["High"]),
                "low": float(last["Low"]),
                "previous_close": info.get("previousClose") if info else None,
                "volume": int(volume),
                "market_cap": info.get("marketCap") if info else None,
                "currency": info.get("currency", "INR") if info else "INR",
                "timestamp": datetime.utcnow().isoformat()
            }
        except Exception as e:
            if isinstance(e, ValueError):
                raise
            raise ValueError(f"Error fetching stock data for {symbol}: {str(e)}")

    @staticmethod
    def get_multiple(symbols: list):
        results = []

        for symbol in symbols:
            try:
                results.append(IndianMarketService.get_stock(symbol))
            except:
                continue

        return results