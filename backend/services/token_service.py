import datetime
import jwt
import os
from backend.config import settings

class TokenService:

    @staticmethod
    def generate_token(username):
        payload = {
            "sub": username,
            "exp": datetime.datetime.utcnow() + datetime.timedelta(
                hours = settings.JWT_EXPIRY_HOURS
            ),
        }
        return jwt.encode(payload, settings.SECRET_KEY, algorithm="HS256")

    @staticmethod
    def verify_token(token: str):
        try:
            decoded = jwt.decode(token, settings.SECRET_KEY, algorithms=["HS256"])
            return decoded["sub"]
        except:
            return None