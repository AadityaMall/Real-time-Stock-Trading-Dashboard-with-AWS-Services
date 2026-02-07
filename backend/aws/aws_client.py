import boto3
import os

class AWSClientFactory:
    @staticmethod
    def dynamodb():
        return boto3.resource(
            "dynamodb",
            region_name=os.getenv("AWS_REGION", "ap-south-1")
        )

    @staticmethod
    def sns():
        return boto3.client(
            "sns",
            region_name=os.getenv("AWS_REGION", "ap-south-1")
        )