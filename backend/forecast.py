import pandas as pd
from prophet import Prophet

def generate_forecast(csv_path):
    df = pd.read_csv(csv_path)

    df = df.rename(columns={
        "date": "ds",
        "price": "y"
    })

    model = Prophet()
    model.fit(df)

    future = model.make_future_dataframe(periods=7)
    forecast = model.predict(future)

    result = forecast.tail(7)[["ds", "yhat", "yhat_lower", "yhat_upper"]]

    latest = result.iloc[-1]

    return {
        "predicted_price": round(latest["yhat"], 2),
        "lower_bound": round(latest["yhat_lower"], 2),
        "upper_bound": round(latest["yhat_upper"], 2)
    }