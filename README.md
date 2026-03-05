🌾 GramVaani
AI‑Powered Rural Intelligence Platform for Farmers & Cooperatives
GramVaani is an AI‑driven agricultural intelligence platform built using AWS Serverless Architecture and Generative AI.

The platform transforms agricultural data signals into actionable insights, helping farmers and rural cooperatives make better crop management and market decisions.

It combines:

🌦 Weather signals

📈 Crop price forecasting

🤖 Generative AI advisory

🧠 Decision intelligence

to provide clear agricultural recommendations through a simple web dashboard.

🚜 Problem Statement
Agriculture faces multiple systemic challenges:

Crop price volatility

Weather‑driven agricultural risks

Lack of real‑time advisory for farmers

Limited decision intelligence for rural cooperatives

Farmers often rely on:

delayed market information

local intermediaries

guesswork for harvest timing

As a result:

crop losses increase

profits decrease

decisions become reactive instead of strategic

There is a need for an AI‑powered platform that converts agricultural data into actionable guidance.

💡 Our Solution
GramVaani provides an AI‑powered rural intelligence dashboard that generates:

✔ Crop price forecasts
✔ Weather risk indicators
✔ AI‑generated agricultural advisory
✔ Cooperative‑level insights

Users can simply select:

Crop + State
The platform then produces:

price predictions

weather signals

AI advisory recommendations

This allows farmers to make data‑driven agricultural decisions.

🤖 Why AI is Required
Traditional agricultural dashboards only show raw historical data.

However, farmers need:

interpretation of signals

actionable recommendations

localized advisory

AI enables:

1️⃣ Data Interpretation
Agricultural data is complex. AI converts it into human‑readable insights.

2️⃣ Decision Support
AI provides guidance such as:

irrigation timing

harvest planning

storage strategies

market timing

3️⃣ Scalability
AI enables personalized recommendations across multiple crops and regions.

🧠 Role of Generative AI
GramVaani uses Amazon Bedrock to generate contextual agricultural advisory.

Inputs to the AI model include:

crop type

state

rainfall

temperature

humidity

weather risk score

predicted crop price

Example input:

Crop: Wheat
State: Andhra Pradesh
Rainfall: 92 mm
Temperature: 33°C
Humidity: 65%
Risk Score: 1
Predicted Price: ₹2402 per quintal
Amazon Bedrock generates:

irrigation recommendations

crop management guidance

harvest timing suggestions

post‑harvest storage advice

This converts raw agricultural data into practical farmer guidance.

☁️ AWS Architecture
GramVaani is built using a serverless AWS architecture.

Architecture Flow
User Request
      │
      ▼
React Frontend (AWS Amplify)
      │
      ▼
Amazon API Gateway
      │
      ▼
AWS Lambda (Forecast Engine)
      │
      ▼
Agricultural Dataset Processing
      │
      ▼
Amazon Bedrock (Generative AI)
      │
      ▼
AI Advisory Generated
      │
      ▼
Response returned to Dashboard
🧩 AWS Services Used
🟠 Amazon Bedrock
Generative AI model used to generate agricultural advisory.

Capabilities:

Foundation model inference

Prompt‑based advisory generation

🔵 AWS Lambda
Serverless compute used for:

forecast processing

agricultural data analysis

Bedrock integration

API logic

Benefits:

auto‑scaling

pay‑per‑use

no server management

🟢 Amazon API Gateway
Public API interface for the application.

Example endpoint:

/forecast?crop=Wheat&state=Punjab
Responsibilities:

request routing

secure API access

Lambda integration

🟣 AWS Amplify
Hosts the React frontend dashboard.

Features:

CI/CD with GitHub

HTTPS hosting

global CDN delivery

🟡 Amazon DynamoDB (Optional Layer)
Can be used to store:

forecast history

advisory logs

crop intelligence

Supports future scalability.

📊 Features
🌾 Crop Forecast Dashboard
Displays predicted crop prices based on agricultural signals.

🌦 Weather Intelligence
Shows rainfall, temperature, humidity, and weather risk indicators.

🤖 AI Advisory Engine
Generates structured agricultural recommendations using Amazon Bedrock.

🏢 Cooperative Insights
Provides strategic insights for rural agricultural cooperatives.

📄 PDF Report Generation
Users can download a complete agricultural report.

🧪 Dataset Generation
A synthetic agricultural dataset was generated using Python to simulate:

28 Indian states

18 crop types

6 months of agricultural signals

Dataset features include:

date
state
crop
price
rainfall_mm
temperature_c
humidity_percent
weather_risk_score
This enables simulation of price fluctuations and weather impacts.

🖥 Tech Stack
Frontend
React

Chart.js

React Maps

HTML / CSS

Backend
Python

FastAPI

Mangum (Lambda adapter)

Cloud Infrastructure
AWS Lambda

Amazon API Gateway

Amazon Bedrock

AWS Amplify

🚀 Deployment
Backend Deployment
Backend services are deployed using:

AWS Lambda + API Gateway
Public API Endpoint Example:

https://api.example.com/forecast
Frontend Deployment
Frontend is deployed using AWS Amplify.

Amplify automatically builds and deploys the React application from GitHub.

👥 User Personas
👨‍🌾 Farmer
Receives:

crop price forecasts

weather risk alerts

AI advisory recommendations

Benefits:

improved crop planning

reduced crop loss

better market timing

🏢 Rural Cooperative
Receives:

regional crop intelligence

procurement insights

logistics planning signals

Benefits:

smarter procurement

optimized storage management

🔮 Future Improvements
Planned enhancements include:

real‑time weather API integration

crop disease prediction models

satellite imagery analysis

multilingual advisory support

mobile application for farmers

🌍 Impact
Agriculture supports over 50% of India's population.

GramVaani demonstrates how AI and cloud infrastructure can empower rural communities with:

data‑driven insights

improved productivity

smarter agricultural decisions

📽 Demo
Live MVP: https://main.d2wf3ekiigkilm.amplifyapp.com/
Video Demo:

(Add submission video link here)
📂 Repository Structure
GramVaani
│
├── frontend
│   ├── src
│   ├── public
│   └── package.json
│
├── backend
│   ├── app.py
│   ├── bedrock.py
│   └── forecast logic
│
├── dataset
│   └── generate_dataset.py
│
└── README.md
🏁 Conclusion
GramVaani demonstrates how Generative AI + AWS serverless architecture can transform agricultural decision‑making.

By combining:

AI intelligence

cloud scalability

agricultural insights

the platform empowers farmers and cooperatives with accessible agricultural intelligence.

Built with ❤️ for AI for Bharat