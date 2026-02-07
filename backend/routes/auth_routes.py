from flask import Blueprint, request, jsonify, make_response
from backend.middleware.auth_middleware import jwt_required
from backend.config import settings
from datetime import datetime, timedelta
auth_bp = Blueprint("auth", __name__)

def create_auth_routes(auth_service):

    @auth_bp.route("/register", methods=["POST"])
    def register():
        data = request.get_json()
        try:
            print("register called")
            result = auth_service.register_user(
                data.get("username"),
                data.get("password")
            )
            if not result:
                return jsonify({"error": "Invalid credentials"}), 401

            user, token =  result

            response =  make_response(jsonify({
                "message": "User created successfully",
                "user": user.to_dict()
            }))
            cookie_expiry = datetime.utcnow() + timedelta(hours=settings.JWT_EXPIRY_HOURS)
            # For development: use Lax (works for same-site localhost)
            # For production: use None with Secure=True (required for cross-site)
            is_production = settings.ENVIRONMENT == "production"
            response.set_cookie(
                "jwt_token",
                token,
                httponly=True,
                secure=is_production,
                expires=cookie_expiry,
                samesite="Lax" if not is_production else "None",
                path="/"
            )
            return response
        except ValueError as e:
            return jsonify({"error": str(e)}), 400

    @auth_bp.route("/login", methods=["POST"])
    def login():
        """
        Login user
        ---
        tags:
          - Auth
        responses:
          200:
            description: Success
        """
        data = request.get_json()
        print("logged in called")
        print(data)
        result = auth_service.authenticate_user(
            data.get("username"),
            data.get("password")
        )

        if not result:
            return jsonify({"error": "Invalid credentials"}), 401

        user, token = result

        response = make_response(jsonify({
            "message": "User logged in",
            "user": user.to_dict()
        }))
        cookie_expiry = datetime.utcnow() + timedelta(hours=settings.JWT_EXPIRY_HOURS)
        # For development: use Lax (works for same-site localhost)
        # For production: use None with Secure=True (required for cross-site)
        is_production = settings.ENVIRONMENT == "production"
        response.set_cookie(
            "jwt_token",
            token,
            httponly=True,
            secure=is_production,
            expires=cookie_expiry,
            samesite="Lax" if not is_production else "None",
            path="/"
        )
        return response

    @auth_bp.route("/logout", methods=["POST"])
    def logout():
        response = make_response(jsonify({"message": "Logged out"}))
        response.delete_cookie("jwt_token", path="/")
        return response

    @auth_bp.route("/verify", methods=["GET"])
    @jwt_required
    def verify():
        from flask import g
        return jsonify({"username": g.username}), 200

    return auth_bp