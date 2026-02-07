import boto3
import os
from backend.config import settings
class AWSClientFactory:
    @staticmethod
    def dynamodb():
        return boto3.resource(
            "dynamodb",
            region_name= settings.AWS_REGION,
        )

    @staticmethod
    def sns():
        return boto3.client(
            "sns",
            region_name= settings.AWS_REGION,
        )