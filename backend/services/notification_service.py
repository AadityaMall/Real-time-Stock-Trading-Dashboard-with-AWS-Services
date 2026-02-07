from backend.aws.aws_client import AWSClientFactory

class NotificationService:
    def __init__(self, topic_arn: str):
        self.sns = AWSClientFactory.sns()
        self.topic_arn = topic_arn

    def publish(self, message: str):
        return self.sns.publish(
            TopicArn=self.topic_arn,
            Message=message
        )