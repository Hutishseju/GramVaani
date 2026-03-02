import boto3
import json

bedrock = boto3.client("bedrock-runtime", region_name="us-east-1")

def generate_advisory(forecast_data):

    prompt = f"""
    You are an agricultural advisory AI.
    
    Forecasted Price: {forecast_data['predicted_price']}
    Confidence Range: {forecast_data['lower_bound']} - {forecast_data['upper_bound']}
    
    Generate simple farmer-friendly advice.
    """

    response = bedrock.invoke_model(
        modelId="anthropic.claude-3-sonnet-20240229-v1:0",
        body=json.dumps({
            "anthropic_version": "bedrock-2023-05-31",
            "max_tokens": 300,
            "messages": [
                {
                    "role": "user",
                    "content": prompt
                }
            ]
        })
    )

    result = json.loads(response["body"].read())
    return result["content"][0]["text"]