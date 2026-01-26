from flasgger import Swagger
from flask import Flask
from flask_cors import CORS

from repositories.user_store import UserStore
from repositories.portfolio_store import PortfolioStore
from services.auth_service import AuthService
from services.trade_service import TradingService
from services.portfolio_service import PortfolioService
from routes.auth_routes import create_auth_routes
from routes.market_routes import create_market_routes
from routes.trading_routes import create_trading_routes
from routes.portfolio_routes import create_portfolio_routes

def create_app():
    app = Flask(__name__)
    CORS(app, supports_credentials=True, origins=["http://localhost:3000"])

    # Initialize core components
    user_store = UserStore()
    auth_service = AuthService(user_store)
    portfolio_store = PortfolioStore()
    portfolio_service = PortfolioService(portfolio_store)
    trading_service = TradingService(portfolio_service)
    # Register routes
    auth_routes = create_auth_routes(auth_service)
    app.register_blueprint(auth_routes, url_prefix="/auth")
    app.register_blueprint(create_market_routes(), url_prefix="/market")
    app.register_blueprint(create_trading_routes(trading_service), url_prefix="/trade")
    app.register_blueprint(create_portfolio_routes(portfolio_service), url_prefix="/portfolio")

    Swagger(app)

    @app.route("/")
    def home():
        return {
            "message": "AWS-Based Real-Time Stock Analytics & Price Forecasting Platform",
            "status": "Backend running"
        }

    return app


app = create_app()

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=4000, debug=True)