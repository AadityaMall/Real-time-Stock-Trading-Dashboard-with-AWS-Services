import os
from moto import mock_aws
import boto3

from backend.services.notification_service import NotificationService
from backend.utils.notification_builder import (
    build_user_registered_notification,
    build_trade_notification,
)
from backend.config import settings


@mock_aws
def test_sns_user_registration_notification():
    # Ensure region consistency
    os.environ["AWS_REGION"] = settings.AWS_REGION

    sns = boto3.client("sns", region_name=settings.AWS_REGION)

    # ✅ CORRECT: extract TopicArn from response
    topic_arn = sns.create_topic(Name="user-events")["TopicArn"]

    notification_service = NotificationService(topic_arn)

    message = build_user_registered_notification("aadi")
    response = notification_service.publish(message)

    assert response["ResponseMetadata"]["HTTPStatusCode"] == 200


@mock_aws
def test_sns_trade_notification():
    os.environ["AWS_REGION"] = settings.AWS_REGION

    sns = boto3.client("sns", region_name=settings.AWS_REGION)
    topic_arn = sns.create_topic(Name="trade-events")["TopicArn"]

    notification_service = NotificationService(topic_arn)

    message = build_trade_notification(
        username="aadi",
        symbol="RELIANCE",
        quantity=10,
        price=2800.50,
        trade_type="BUY",
    )

    response = notification_service.publish(message)

    assert response["ResponseMetadata"]["HTTPStatusCode"] == 200