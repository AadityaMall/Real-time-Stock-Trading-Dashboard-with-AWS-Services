from werkzeug.security import generate_password_hash, check_password_hash
from models.user import User

class AuthService:
    def __init__(self, user_store):
        self.user_store = user_store

    def register_user(self, username, password):
        if not username or not password:
            raise ValueError("Username and password required")

        if self.user_store.get_user(username):
            raise ValueError("User already exists")

        password_hash = generate_password_hash(password)
        user = User(username, password_hash)

        self.user_store.add_user(user)
        return user

    def authenticate_user(self, username, password):
        user = self.user_store.get_user(username)

        if not user:
            return None

        if not check_password_hash(user.password_hash, password):
            return None

        return user