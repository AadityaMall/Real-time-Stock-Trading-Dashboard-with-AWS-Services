from datetime import datetime

def build_user_registered_notification(username: str) -> str:
    return (
        f"User Registration Alert\n"
        f"Username: {username}\n"
        f"Status: REGISTERED\n"
        f"Time: {datetime.utcnow().isoformat()}"
    )

def build_trade_notification(
    *,
    username: str,
    symbol: str,
    quantity: int,
    price: float,
    trade_type: str
) -> str:
    return (
        f"Trade Alert\n"
        f"User: {username}\n"
        f"Action: {trade_type}\n"
        f"Symbol: {symbol}\n"
        f"Quantity: {quantity}\n"
        f"Price: ₹{price}\n"
        f"Time: {datetime.utcnow().isoformat()}"
    )