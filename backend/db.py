import boto3
from datetime import datetime

dynamodb = boto3.resource("dynamodb", region_name="us-east-1")
table = dynamodb.Table("GramVaaniForecasts")

def store_forecast(crop, forecast, advisory):
    table.put_item(
        Item={
            "crop": crop,
            "timestamp": str(datetime.utcnow()),
            "forecast": forecast,
            "advisory": advisory
        }
    )