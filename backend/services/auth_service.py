from werkzeug.security import generate_password_hash, check_password_hash
from backend.models.user import User
from backend.services.token_service import TokenService
from backend.utils.notification_builder import build_user_registered_notification
from backend.repositories.portfolio_store_dynamo import PortfolioStoreDynamo


class AuthService:
    def __init__(self, user_store, notification_service=None):
        self.user_store = user_store
        self.notification_service = notification_service
        self.portfolio_store = PortfolioStoreDynamo()

    def register_user(self, username, password):
        if not username or not password:
            raise ValueError("Username and password required")

        if self.user_store.get_user(username):
            raise ValueError("User already exists")

        password_hash = generate_password_hash(password, method="pbkdf2:sha256")
        user = User(username, password_hash)

        # 1️⃣ Save user
        self.user_store.add_user(user)

        # 2️⃣ CREATE PORTFOLIO (🔥 missing piece)
        self.portfolio_store.get_or_create(user.username)

        # 3️⃣ Generate token
        token = TokenService.generate_token(user.username)

        # 4️⃣ Notification
        if self.notification_service:
            message = build_user_registered_notification(username)
            self.notification_service.publish(message)

        return user, token

    def authenticate_user(self, username, password):
        user = self.user_store.get_user(username)

        if not user:
            return None

        if not check_password_hash(user.password_hash, password):
            return None

        token = TokenService.generate_token(user.username)
        return user, token