from flask import request, jsonify, g
from services.token_service import TokenService

def jwt_required(func):
    def wrapper(*args, **kwargs):
        token = request.cookies.get("jwt_token")

        if not token:
            return jsonify({"error": "Missing auth token"}), 401

        username = TokenService.verify_token(token)

        if not username:
            return jsonify({"error": "Invalid or expired token"}), 401

        # ✅ Store user in Flask global request context
        g.username = username

        return func(*args, **kwargs)

    wrapper.__name__ = func.__name__
    return wrapper