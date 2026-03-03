import boto3
import json

bedrock = boto3.client("bedrock-runtime", region_name="us-east-1")

def generate_advisory(data):

    prompt = f"""
    You are an agricultural advisor for Indian farmers.

    Crop: {data['crop']}
    State: {data['state']}
    Predicted Price: ₹{data['predicted_price']}

    Provide short farmer-friendly advice.
    """

    response = bedrock.invoke_model(
        modelId="anthropic.claude-3-sonnet-20240229-v1",  # <-- updated
        body=json.dumps({
            "anthropic_version": "bedrock-2023-05-31",
            "max_tokens": 1024,
            "temperature": 0.5,
            "messages": [
                {"role": "user", "content": prompt}
            ]
        })
    )

    result = json.loads(response["body"].read())
    return result["content"][0]["text"]