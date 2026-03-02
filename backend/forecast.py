import pandas as pd
import boto3
import io
from prophet import Prophet

s3 = boto3.client("s3")

def generate_forecast(crop, state):

    bucket = "gramvaani-data"
    key = "mandi_sample.csv"

    obj = s3.get_object(Bucket=bucket, Key=key)
    df = pd.read_csv(io.BytesIO(obj["Body"].read()))

    # Filter by state and crop
    df = df[(df["crop"] == crop) & (df["state"] == state)]

    df["date"] = pd.to_datetime(df["date"])

    # Prepare Prophet format
    prophet_df = df[["date", "price"]].rename(columns={
        "date": "ds",
        "price": "y"
    })

    model = Prophet()
    model.fit(prophet_df)

    future = model.make_future_dataframe(periods=7)
    forecast = model.predict(future)

    latest = forecast.iloc[-1]

    # Get latest weather info
    latest_weather = df.iloc[-1]

    return {
        "state": state,
        "crop": crop,
        "predicted_price": round(latest["yhat"], 2),
        "lower_bound": round(latest["yhat_lower"], 2),
        "upper_bound": round(latest["yhat_upper"], 2),
        "rainfall_mm": latest_weather["rainfall_mm"],
        "temperature_c": latest_weather["temperature_c"],
        "humidity_percent": latest_weather["humidity_percent"],
        "weather_risk_score": int(latest_weather["weather_risk_score"])
    }