from flask import Blueprint, jsonify
from services.indian_market_service import PriceService

price_bp = Blueprint("price", __name__)

def create_price_routes():

    @price_bp.route("/price/<symbol>", methods=["GET"])
    def get_price(symbol):
        try:
            price = PriceService.get_stock_price(symbol)
            return jsonify({
                "symbol": symbol.upper(),
                "price": price
            })
        except Exception as e:
            return jsonify({"error": str(e)}), 400

    return price_bp