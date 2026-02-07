from flasgger import Swagger
from flask import Flask
from flask_cors import CORS
from backend.config import settings
from backend.repositories.user_store import UserStore
from backend.repositories.portfolio_store import PortfolioStore
from backend.repositories.user_store_dynamo import UserStoreDynamo
from backend.repositories.portfolio_store_dynamo import PortfolioStoreDynamo
from backend.services.auth_service import AuthService
from backend.services.notification_service import NotificationService
from backend.services.trade_service import TradingService
from backend.services.portfolio_service import PortfolioService
from backend.routes.auth_routes import create_auth_routes
from backend.routes.market_routes import create_market_routes
from backend.routes.trading_routes import create_trading_routes
from backend.routes.portfolio_routes import create_portfolio_routes

def create_app():
    app = Flask(__name__)
    CORS(app, supports_credentials=True, origins=["http://localhost:3000"])
    app.secret_key = settings.SECRET_KEY
    # Initialize core components
    if settings.USE_AWS == 'True':
        notification_service = NotificationService(settings.SNS_TOPIC_ARN)
        print("using dynamodb")
        user_store = UserStoreDynamo()
        portfolio_store = PortfolioStoreDynamo()
    else:
        notification_service = NotificationService(None)
        print("using local dictionaries")
        user_store = UserStore()
        portfolio_store = PortfolioStore()


    auth_service = AuthService(user_store)
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