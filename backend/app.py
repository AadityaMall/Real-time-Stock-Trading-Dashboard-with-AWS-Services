import sys
print(sys.path)

from flask import Flask

# backend/app.py
from repositories.user_store import UserStore
from services.auth_service import AuthService
from routes.auth_routes import create_auth_routes

def create_app():
    app = Flask(__name__)

    # Initialize core components
    user_store = UserStore()
    auth_service = AuthService(user_store)

    # Register routes
    auth_routes = create_auth_routes(auth_service)
    app.register_blueprint(auth_routes, url_prefix="/auth")

    @app.route("/")
    def home():
        return {
            "message": "AWS-Based Real-Time Stock Analytics & Price Forecasting Platform",
            "status": "Backend running"
        }

    return app


app = create_app()

if __name__ == "__main__":
    app.run(debug=True)