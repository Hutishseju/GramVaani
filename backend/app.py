from fastapi import FastAPI
from forecast import generate_forecast
from bedrock import generate_advisory
from db import store_forecast
from mangum import Mangum

app = FastAPI()

@app.get("/forecast")
def forecast(crop: str = "wheat"):
    
    forecast_data = generate_forecast("../data/mandi_sample.csv")

    advisory = generate_advisory(forecast_data)

    store_forecast(crop, forecast_data, advisory)

    return {
        "crop": crop,
        "forecast": forecast_data,
        "advisory": advisory
    }

handler = Mangum(app)