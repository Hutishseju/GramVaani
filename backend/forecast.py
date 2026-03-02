import random

def generate_forecast(crop, state):

    base_price = random.randint(2000, 5000)

    return {
        "state": state,
        "crop": crop,
        "predicted_price": base_price,
        "lower_bound": base_price - 150,
        "upper_bound": base_price + 150,
        "rainfall_mm": random.randint(10, 100),
        "temperature_c": random.randint(20, 40),
        "humidity_percent": random.randint(40, 90),
        "weather_risk_score": random.randint(0, 3)
    }