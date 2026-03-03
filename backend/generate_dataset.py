import pandas as pd
import numpy as np
from datetime import datetime, timedelta
import random

# All 28 states
states = [
"Andhra Pradesh","Arunachal Pradesh","Assam","Bihar","Chhattisgarh",
"Goa","Gujarat","Haryana","Himachal Pradesh","Jharkhand",
"Karnataka","Kerala","Madhya Pradesh","Maharashtra","Manipur",
"Meghalaya","Mizoram","Nagaland","Odisha","Punjab",
"Rajasthan","Sikkim","Tamil Nadu","Telangana","Tripura",
"Uttar Pradesh","Uttarakhand","West Bengal"
]

# Crops
crops = {
"Wheat":2200,"Rice":1900,"Maize":1700,"Barley":1800,"Bajra":1600,"Jowar":1500,
"Tur (Arhar)":6500,"Chana (Gram)":5200,"Moong":7200,"Urad":6800,
"Masoor":6000,"Rajma":7500,
"Mustard":5500,"Soybean":4300,"Groundnut":5800,"Sunflower":5000,
"Cotton":7200,"Sugarcane":320
}

start_date = datetime(2024,1,1)
days = 180   # 6 months

rows = []

for state in states:
    for crop, base_price in crops.items():
        price = base_price
        
        for i in range(days):
            date = start_date + timedelta(days=i)

            # Simulate weather
            rainfall = random.uniform(0, 200)  # mm
            temperature = random.uniform(10, 45)  # Celsius
            humidity = random.uniform(30, 95)

            # Weather risk logic
            risk_score = 0
            if rainfall > 150:
                risk_score += 2
            if temperature > 40:
                risk_score += 2
            if humidity > 85:
                risk_score += 1

            # Price impact from weather
            weather_impact = np.random.randint(-30, 40)
            price = max(price + weather_impact - (risk_score * 5), 100)

            rows.append([
                date.strftime("%Y-%m-%d"),
                state,
                crop,
                round(price,2),
                round(rainfall,2),
                round(temperature,2),
                round(humidity,2),
                risk_score
            ])


df = pd.DataFrame(rows, columns=[
    "date","state","crop","price",
    "rainfall_mm","temperature_c",
    "humidity_percent","weather_risk_score"
])

df.to_csv("india_national_agri_weather_dataset.csv", index=False)

print("National agriculture + weather dataset generated successfully.")