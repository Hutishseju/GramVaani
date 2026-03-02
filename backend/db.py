import boto3
from datetime import datetime

dynamodb = boto3.resource("dynamodb", region_name="us-east-1")
table = dynamodb.Table("GramVaaniForecasts")

def store_forecast(data, advisory):

    table.put_item(
        Item={
            "crop": data["crop"],
            "state": data["state"],
            "timestamp": str(datetime.utcnow()),
            "predicted_price": data["predicted_price"],
            "rainfall": data["rainfall_mm"],
            "temperature": data["temperature_c"],
            "humidity": data["humidity_percent"],
            "risk_score": data["weather_risk_score"],
            "advisory": advisory
        }
    )