# GramVaani – System Design Document
## Aryavart Analytics

## 1. System Overview

GramVaani is a cloud-native AI decision intelligence platform for rural ecosystems. It integrates forecasting models, risk scoring engines, and multilingual advisory LLM modules.

---

## 2. High-Level Architecture

User (Farmer / Cooperative)
        |
Web / Voice Interface
        |
API Gateway
        |
Application Layer (FastAPI)
        |
AI Processing Engine
    - Time-Series Forecast Model
    - Weather Risk Model
    - Demand Clustering Model
    - LLM Advisory Module
        |
Data Layer
    - Public Crop Dataset
    - Weather Dataset
    - Synthetic Data Store
        |
Cloud Infrastructure (AWS)

---

## 3. Component Design

### 3.1 Data Layer
- Stored in S3
- Structured via ETL pipeline
- Cleaned & normalized datasets

### 3.2 Forecast Engine
- Prophet or LSTM
- Trained on historical mandi data
- Generates short-term prediction

### 3.3 Risk Model
- Combines weather variance + price volatility
- Produces numerical risk score

### 3.4 Advisory Engine
- LLM-based explanation generator
- Converts model output into user-friendly insights
- Multilingual support

### 3.5 Application Layer
- REST APIs
- Secure token-based authentication
- Dashboard rendering

---

## 4. Deployment Architecture

- AWS EC2 / Lambda
- S3 for dataset storage
- API Gateway
- CloudWatch monitoring
- Optional SageMaker for ML training

---

## 5. Scalability Design

- Microservice-ready structure
- Stateless API design
- Auto-scaling compute layer
- Horizontal expansion across states

---

## 6. Security Considerations

- HTTPS encrypted APIs
- IAM-based access control
- No sensitive personal data storage

---

## 7. Limitations

- Forecast accuracy dependent on public dataset quality.
- Requires stable internet.
- Prototype-level dataset coverage.
