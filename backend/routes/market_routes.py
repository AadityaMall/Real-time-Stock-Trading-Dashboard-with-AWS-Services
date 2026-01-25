from flask import Blueprint, request, jsonify
from services.indian_market_service import IndianMarketService

market_bp = Blueprint("market", __name__)


def create_market_routes():

    @market_bp.route("/price/<symbol>", methods=["GET"])
    def get_price(symbol):
        try:
            data = IndianMarketService.get_stock(symbol)
            return jsonify(data), 200
        except Exception as e:
            return jsonify({"error": str(e)}), 400

    @market_bp.route("/prices", methods=["POST"])
    def get_multiple_prices():
        body = request.get_json()
        symbols = body.get("symbols", [])
        print(symbols)
        if not symbols:
            return jsonify({"error": "Symbols list required"}), 400

        data = IndianMarketService.get_multiple(symbols)
        return jsonify(data), 200


    return market_bp