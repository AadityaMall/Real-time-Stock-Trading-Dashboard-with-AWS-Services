from flask import Blueprint, request, jsonify, g
from middleware.auth_middleware import jwt_required

trading_bp = Blueprint("trading", __name__)

def create_trading_routes(trading_service):

    @trading_bp.route("/buy", methods=["POST"])
    @jwt_required
    def buy():
        body = request.get_json()
        symbol = body.get("symbol")
        qty = int(body.get("quantity"))

        try:
            result = trading_service.buy_stock(g.username, symbol, qty)
            return jsonify(result), 200
        except Exception as e:
            return jsonify({"error": str(e)}), 400

    @trading_bp.route("/sell", methods=["POST"])
    @jwt_required
    def sell():
        body = request.get_json()
        symbol = body.get("symbol")
        qty = int(body.get("quantity"))

        try:
            result = trading_service.sell_stock(g.username, symbol, qty)
            return jsonify(result), 200
        except Exception as e:
            return jsonify({"error": str(e)}), 400

    return trading_bp