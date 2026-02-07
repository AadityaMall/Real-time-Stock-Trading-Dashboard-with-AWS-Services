from moto import mock_aws
import boto3
from backend.repositories.user_store_dynamo import UserStoreDynamo
from backend.repositories.portfolio_store_dynamo import PortfolioStoreDynamo
from backend.models.user import User

@mock_aws
def test_dynamo_stores():
    dynamodb = boto3.resource("dynamodb", region_name="ap-south-1")

    dynamodb.create_table(
        TableName="Users",
        KeySchema=[{"AttributeName": "username", "KeyType": "HASH"}],
        AttributeDefinitions=[{"AttributeName": "username", "AttributeType": "S"}],
        BillingMode="PAY_PER_REQUEST"
    )

    dynamodb.create_table(
        TableName="Portfolios",
        KeySchema=[{"AttributeName": "username", "KeyType": "HASH"}],
        AttributeDefinitions=[{"AttributeName": "username", "AttributeType": "S"}],
        BillingMode="PAY_PER_REQUEST"
    )

    user_store = UserStoreDynamo()
    portfolio_store = PortfolioStoreDynamo()

    user = User("aadi", "hashed_pw")
    user_store.add_user(user)

    fetched = user_store.get_user("aadi")
    assert fetched.username == "aadi"

    portfolio = portfolio_store.get_or_create("aadi")
    assert portfolio.username == "aadi"