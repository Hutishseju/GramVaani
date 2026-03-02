from fastapi import FastAPI
from forecast import generate_forecast
from bedrock import generate_advisory
from db import store_forecast
from mangum import Mangum

app = FastAPI()

@app.get("/forecast")
def forecast(crop: str, state: str):

    forecast_data = generate_forecast(crop, state)

    advisory = generate_advisory(forecast_data)

    store_forecast(forecast_data, advisory)

    return {
        "forecast": forecast_data,
        "advisory": advisory
    }

handler = Mangum(app)