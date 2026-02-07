from werkzeug.security import generate_password_hash, check_password_hash
from backend.models.user import User
from backend.services.token_service import TokenService


class AuthService:
    def __init__(self, user_store):
        self.user_store = user_store

    def register_user(self, username, password):
        if not username or not password:
            raise ValueError("Username and password required")

        if self.user_store.get_user(username):
            raise ValueError("User already exists")

        password_hash = generate_password_hash(password, method="pbkdf2:sha256")
        user = User(username, password_hash)

        self.user_store.add_user(user)

        token = TokenService.generate_token(user.username)

        return user, token

    def authenticate_user(self, username, password):
        user = self.user_store.get_user(username)

        if not user:
            return None

        if not check_password_hash(user.password_hash, password):
            return None

        token = TokenService.generate_token(user.username)

        return user, token