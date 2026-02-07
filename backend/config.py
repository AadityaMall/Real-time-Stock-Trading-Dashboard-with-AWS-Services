import os
from dotenv import load_dotenv

load_dotenv()

class Settings:

    # Core App
    ENVIRONMENT = os.getenv("ENVIRONMENT", "development")
    SECRET_KEY = os.getenv("SECRET_KEY", "dev-secret-key")

    # Stock
    ALPHAVANTAGE_API_KEY = os.getenv("ALPHAVANTAGE_API_KEY")

    # JWT
    JWT_EXPIRY_HOURS = int(os.getenv("JWT_EXPIRY_HOURS", 6))

    # AWS
    USE_AWS = os.getenv("USE_AWS", False)
    AWS_REGION = os.getenv("AWS_REGION", "ap-south-1")

    # DynamoDB Tables
    DYNAMODB_TABLE_USERS = os.getenv("DYNAMODB_TABLE_USERS", "UsersTable")
    DYNAMODB_TABLE_TRADES = os.getenv("DYNAMODB_TABLE_TRADES", "TradesTable")

    # SNS
    SNS_TOPIC_ARN = os.getenv("SNS_TOPIC_ARN", "")


# Singleton settings object
settings = Settings()