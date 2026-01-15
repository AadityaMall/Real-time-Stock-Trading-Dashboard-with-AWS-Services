from flask import Blueprint, request, jsonify

auth_bp = Blueprint("auth", __name__)

def create_auth_routes(auth_service):

    @auth_bp.route("/register", methods=["POST"])
    def register():
        data = request.get_json()
        try:
            user = auth_service.register_user(
                data.get("username"),
                data.get("password")
            )
            return jsonify({
                "message": "User registered successfully",
                "user": user.to_dict()
            }), 201
        except ValueError as e:
            return jsonify({"error": str(e)}), 400

    @auth_bp.route("/login", methods=["POST"])
    def login():
        data = request.get_json()
        user = auth_service.authenticate_user(
            data.get("username"),
            data.get("password")
        )

        if not user:
            return jsonify({"error": "Invalid credentials"}), 401

        return jsonify({
            "message": "Login successful",
            "user": user.to_dict()
        }), 200

    return auth_bp