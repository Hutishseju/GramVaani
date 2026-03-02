import boto3
import json

bedrock = boto3.client("bedrock-runtime", region_name="us-east-1")

def generate_advisory(data):

    prompt = f"""
    You are an agricultural advisory AI for rural farmers in India.

    Crop: {data['crop']}
    State: {data['state']}
    Predicted Price: ₹{data['predicted_price']}
    Confidence Range: ₹{data['lower_bound']} - ₹{data['upper_bound']}

    Weather Conditions:
    Rainfall: {data['rainfall_mm']} mm
    Temperature: {data['temperature_c']} °C
    Humidity: {data['humidity_percent']} %
    Risk Score: {data['weather_risk_score']}

    Give simple farmer-friendly advice about:
    - Whether to sell or hold
    - Weather risks
    - Market outlook
    Keep it short and practical.
    """

    response = bedrock.invoke_model(
        modelId="anthropic.claude-3-sonnet-20240229-v1:0",
        body=json.dumps({
            "anthropic_version": "bedrock-2023-05-31",
            "max_tokens": 300,
            "messages": [
                {"role": "user", "content": prompt}
            ]
        })
    )

    result = json.loads(response["body"].read())
    return result["content"][0]["text"]