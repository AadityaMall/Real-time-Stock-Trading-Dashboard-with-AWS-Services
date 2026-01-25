from flask import request, jsonify, g
from services.token_service import TokenService
import functools

def jwt_required(func):
    @functools.wraps(func)
    def wrapper(*args, **kwargs):
        # Check if token exists in cookies
        token = request.cookies.get("jwt_token")
        
        # Also check Authorization header as fallback
        if not token:
            auth_header = request.headers.get("Authorization")
            if auth_header and auth_header.startswith("Bearer "):
                token = auth_header.split(" ")[1]

        if not token:
            return jsonify({
                "error": "Authentication required",
                "message": "Missing authentication token. Please log in."
            }), 401

        try:
            username = TokenService.verify_token(token)
            
            if not username:
                return jsonify({
                    "error": "Invalid authentication token",
                    "message": "Token is invalid or expired. Please log in again."
                }), 401

            # ✅ Store user in Flask global request context
            g.username = username

            return func(*args, **kwargs)
        except Exception as e:
            return jsonify({
                "error": "Authentication failed",
                "message": "Token verification failed. Please log in again."
            }), 401

    return wrapper