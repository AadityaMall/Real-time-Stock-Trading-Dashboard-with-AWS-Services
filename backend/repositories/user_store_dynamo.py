from backend.aws.aws_client import AWSClientFactory
from backend.models.user import User


class UserStoreDynamo:
    def __init__(self, table_name="Users"):
        self.table = AWSClientFactory.dynamodb().Table(table_name)

    def add_user(self, user: User):
        self.table.put_item(
            Item={
                "username": user.username,
                "password_hash": user.password_hash
            }
        )

    def get_user(self, username):
        res = self.table.get_item(Key={"username": username})
        item = res.get("Item")

        if not item:
            return None

        return User(item["username"], item["password_hash"])