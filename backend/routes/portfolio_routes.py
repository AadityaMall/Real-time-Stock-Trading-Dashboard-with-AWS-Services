from flask import Blueprint, jsonify, request, g
from middleware.auth_middleware import jwt_required

portfolio_bp = Blueprint("portfolio", __name__)

def create_portfolio_routes(portfolio_service):

    @portfolio_bp.route("/", methods=["GET"])
    @jwt_required
    def get_portfolio():
        data = portfolio_service.get_full_portfolio_view(g.username)
        return jsonify(data), 200

    return portfolio_bp