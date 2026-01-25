from flask import Blueprint, request, jsonify, make_response

auth_bp = Blueprint("auth", __name__)

def create_auth_routes(auth_service):

    @auth_bp.route("/register", methods=["POST"])
    def register():
        data = request.get_json()
        try:
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
            response.set_cookie(
                "jwt_token",
                token,
                httponly=True,
                secure=True,
                samesite="Lax",
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
        response.set_cookie(
            "jwt_token",
            token,
            httponly=True,
            secure=True,
            samesite="Lax",
        )
        return response

    @auth_bp.route("/logout", methods=["POST"])
    def logout():
        response = make_response(jsonify({"message": "Logged out"}))
        response.delete_cookie("jwt_token")  # ✅ updated name
        return response

    return auth_bp