from flask import Blueprint, request, jsonify, g
from middleware.auth_middleware import jwt_required

trading_bp = Blueprint("trading", __name__)

def create_trading_routes(trading_service):

    @trading_bp.route("/buy", methods=["POST"])
    @jwt_required
    def buy():
        try:
            body = request.get_json()
            
            if not body:
                return jsonify({"error": "Invalid request", "message": "Request body is required"}), 400
            
            symbol = body.get("symbol")
            quantity = body.get("quantity")
            
            if not symbol:
                return jsonify({"error": "Invalid request", "message": "Symbol is required"}), 400
            
            if not quantity:
                return jsonify({"error": "Invalid request", "message": "Quantity is required"}), 400
            
            try:
                qty = int(quantity)
            except (ValueError, TypeError):
                return jsonify({"error": "Invalid request", "message": "Quantity must be a valid number"}), 400

            result = trading_service.buy_stock(g.username, symbol, qty)
            return jsonify(result), 200
        except ValueError as e:
            return jsonify({"error": "Validation error", "message": str(e)}), 400
        except Exception as e:
            return jsonify({"error": "Internal server error", "message": str(e)}), 500

    @trading_bp.route("/sell", methods=["POST"])
    @jwt_required
    def sell():
        try:
            body = request.get_json()
            
            if not body:
                return jsonify({"error": "Invalid request", "message": "Request body is required"}), 400
            
            symbol = body.get("symbol")
            quantity = body.get("quantity")
            
            if not symbol:
                return jsonify({"error": "Invalid request", "message": "Symbol is required"}), 400
            
            if not quantity:
                return jsonify({"error": "Invalid request", "message": "Quantity is required"}), 400
            
            try:
                qty = int(quantity)
            except (ValueError, TypeError):
                return jsonify({"error": "Invalid request", "message": "Quantity must be a valid number"}), 400

            result = trading_service.sell_stock(g.username, symbol, qty)
            return jsonify(result), 200
        except ValueError as e:
            return jsonify({"error": "Validation error", "message": str(e)}), 400
        except Exception as e:
            return jsonify({"error": "Internal server error", "message": str(e)}), 500

    return trading_bp