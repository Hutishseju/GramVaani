# Design Document: GramVaani – Rural Decision Intelligence Platform

## 1. Introduction

### 1.1 Purpose

This document provides the comprehensive system design for GramVaani, an AI-powered Rural Decision Intelligence Platform. It details the architecture, components, data flows, ML pipelines, deployment strategy, and technical considerations necessary to implement the requirements specified in the requirements document.

### 1.2 Scope

This design covers:
- High-level system architecture
- Component-level design for all microservices
- Data flow and integration patterns
- AI/ML pipeline architecture
- AWS cloud deployment architecture
- Scalability and performance strategies
- Security architecture
- System limitations and trade-offs

### 1.3 Design Principles

- **Cloud-Native**: Containerized microservices with elastic scaling
- **Mobile-First**: Optimized for low-bandwidth, intermittent connectivity
- **Data Sovereignty**: Public and synthetic datasets only
- **Multilingual**: Native support for 10 Indian languages
- **Resilient**: Fault-tolerant with graceful degradation
- **Observable**: Comprehensive monitoring and logging
- **Secure**: Defense-in-depth security architecture

## 2. High-Level Architecture

### 2.1 Architecture Overview

GramVaani follows a cloud-native microservices architecture deployed on AWS, consisting of:

```
┌─────────────────────────────────────────────────────────────────┐
│                        Client Layer                              │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐          │
│  │ Mobile App   │  │  Web Portal  │  │ Third-Party  │          │
│  │ (Android/iOS)│  │              │  │ Integrations │          │
│  └──────────────┘  └──────────────┘  └──────────────┘          │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                      API Gateway Layer                           │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │  AWS API Gateway + AWS WAF                               │   │
│  │  - Authentication/Authorization                          │   │
│  │  - Rate Limiting                                         │   │
│  │  - Request Routing                                       │   │
│  └──────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                    Application Services Layer                    │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐          │
│  │   Price      │  │   Weather    │  │   Demand     │          │
│  │  Forecaster  │  │ Risk Scorer  │  │  Predictor   │          │
│  └──────────────┘  └──────────────┘  └──────────────┘          │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐          │
│  │   Advisory   │  │     User     │  │ Notification │          │
│  │    Engine    │  │   Service    │  │   Service    │          │
│  └──────────────┘  └──────────────┘  └──────────────┘          │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                      Data Services Layer                         │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐          │
│  │ Data Ingestion│ │  ML Training │  │    Cache     │          │
│  │   Pipeline    │ │   Pipeline   │  │   Service    │          │
│  └──────────────┘  └──────────────┘  └──────────────┘          │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                       Data Storage Layer                         │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐          │
│  │  Time-Series │  │  Relational  │  │   Document   │          │
│  │  DB (Timestream)│ (RDS Aurora) │  │ Store (DynamoDB)│        │
│  └──────────────┘  └──────────────┘  └──────────────┘          │
│  ┌──────────────┐  ┌──────────────┐                             │
│  │  Data Lake   │  │    Cache     │                             │
│  │    (S3)      │  │ (ElastiCache)│                             │
│  └──────────────┘  └──────────────┘                             │
└─────────────────────────────────────────────────────────────────┘
```

### 2.2 Architecture Layers

#### 2.2.1 Client Layer
- **Mobile Applications**: Native Android/iOS apps with offline capabilities
- **Web Portal**: Responsive web interface for administrators and partners
- **Third-Party Integrations**: API clients for external systems

#### 2.2.2 API Gateway Layer
- **AWS API Gateway**: Managed API gateway for request routing
- **AWS WAF**: Web application firewall for security
- **Authentication**: JWT-based authentication with AWS Cognito
- **Rate Limiting**: Token bucket algorithm for API throttling

#### 2.2.3 Application Services Layer
- **Price Forecaster Service**: Crop price prediction microservice
- **Weather Risk Scorer Service**: Weather-based risk assessment
- **Demand Predictor Service**: Regional demand forecasting
- **Advisory Engine Service**: Multilingual AI advisory
- **User Service**: User management and authentication
- **Notification Service**: Alert and notification delivery

#### 2.2.4 Data Services Layer
- **Data Ingestion Pipeline**: ETL for external data sources
- **ML Training Pipeline**: Model training and deployment
- **Cache Service**: Distributed caching for performance

#### 2.2.5 Data Storage Layer
- **Time-Series Database**: AWS Timestream for price and weather data
- **Relational Database**: Amazon Aurora for transactional data
- **Document Store**: DynamoDB for flexible schema data
- **Data Lake**: S3 for raw and processed data
- **Cache**: ElastiCache (Redis) for hot data

## 3. Component-Level Design

### 3.1 Price Forecaster Service

**Responsibility**: Generate 7-14 day crop price forecasts for mandis

**Technology Stack**:
- Runtime: Python 3.11 with FastAPI
- ML Framework: PyTorch + Prophet for time-series forecasting
- Container: Docker on AWS ECS Fargate

**Key Components**:

```python
class PriceForecaster:
    def __init__(self):
        self.model_registry = ModelRegistry()
        self.data_fetcher = DataFetcher()
        
    async def forecast_price(self, crop: str, mandi: str, 
                            horizon_days: int) -> PriceForecast:
        # Fetch historical data
        historical_data = await self.data_fetcher.get_price_history(
            crop, mandi, lookback_days=365
        )
        
        # Load appropriate model
        model = self.model_registry.get_model(crop, mandi)
        
        # Generate forecast
        predictions = model.predict(horizon_days)
        
        # Calculate confidence intervals
        confidence = self._calculate_confidence(predictions)
        
        return PriceForecast(
            crop=crop,
            mandi=mandi,
            predictions=predictions,
            confidence_intervals=confidence
        )
```

**API Endpoints**:
- `POST /api/v1/price/forecast` - Generate price forecast
- `GET /api/v1/price/history/{crop}/{mandi}` - Historical prices
- `GET /api/v1/price/compare` - Compare multiple mandis

**Data Dependencies**:
- Historical mandi price data (Timestream)
- Crop production data (S3 Data Lake)
- Regional economic indicators (S3 Data Lake)

**Scaling Strategy**:
- Horizontal scaling based on request volume
- Model caching in Redis for frequently requested crops
- Pre-computed forecasts for top 50 crop-mandi combinations

### 3.2 Weather Risk Scorer Service

**Responsibility**: Calculate weather-based agricultural risk scores (0-100)

**Technology Stack**:
- Runtime: Python 3.11 with FastAPI
- ML Framework: Scikit-learn + XGBoost
- Container: Docker on AWS ECS Fargate

**Key Components**:

```python
class WeatherRiskScorer:
    def __init__(self):
        self.weather_client = WeatherAPIClient()
        self.risk_model = RiskScoringModel()
        
    async def calculate_risk(self, location: Location, 
                            crop: str) -> RiskScore:
        # Fetch weather forecast
        weather_data = await self.weather_client.get_forecast(
            location, days=14
        )
        
        # Extract risk factors
        risk_factors = self._extract_risk_factors(
            weather_data, crop
        )
        
        # Calculate risk score
        score = self.risk_model.predict(risk_factors)
        
        # Generate mitigation recommendations
        recommendations = self._generate_recommendations(
            score, risk_factors, crop
        )
        
        return RiskScore(
            score=score,
            factors=risk_factors,
            recommendations=recommendations
        )
```

**API Endpoints**:
- `POST /api/v1/risk/calculate` - Calculate risk score
- `GET /api/v1/risk/alerts/{user_id}` - Get active alerts
- `POST /api/v1/risk/subscribe` - Subscribe to risk alerts

**Data Dependencies**:
- Weather forecast data (IMD API, cached in Timestream)
- Crop vulnerability profiles (DynamoDB)
- Historical crop loss data (S3 Data Lake)

**Scaling Strategy**:
- Auto-scaling based on weather data update cycles
- Batch processing for subscribed users
- Event-driven recalculation on weather updates


### 3.3 Demand Predictor Service

**Responsibility**: Predict regional crop demand and identify demand clusters

**Technology Stack**:
- Runtime: Python 3.11 with FastAPI
- ML Framework: TensorFlow + Scikit-learn for clustering
- Container: Docker on AWS ECS Fargate

**Key Components**:

```python
class DemandPredictor:
    def __init__(self):
        self.demand_model = DemandForecastModel()
        self.cluster_analyzer = ClusterAnalyzer()
        
    async def predict_demand(self, region: str, 
                            season: str) -> DemandPrediction:
        # Fetch regional data
        regional_data = await self._get_regional_data(region)
        
        # Predict top crops
        top_crops = self.demand_model.predict_top_crops(
            regional_data, season, top_n=5
        )
        
        # Identify demand clusters
        clusters = self.cluster_analyzer.identify_clusters(
            region, top_crops
        )
        
        return DemandPrediction(
            region=region,
            season=season,
            top_crops=top_crops,
            demand_clusters=clusters
        )
```

**API Endpoints**:
- `POST /api/v1/demand/predict` - Predict crop demand
- `GET /api/v1/demand/clusters/{region}` - Get demand clusters
- `GET /api/v1/demand/trends` - Regional demand trends

**Data Dependencies**:
- Population demographics (S3 Data Lake)
- Historical consumption patterns (Timestream)
- Market transaction data (S3 Data Lake)
- Transportation network data (DynamoDB)

**Scaling Strategy**:
- Seasonal batch processing for demand predictions
- Cached predictions with 24-hour TTL
- Geographic partitioning for parallel processing

### 3.4 Advisory Engine Service

**Responsibility**: Provide multilingual AI-powered agricultural advisory

**Technology Stack**:
- Runtime: Python 3.11 with FastAPI
- ML Framework: Hugging Face Transformers (mBERT, IndicBERT)
- LLM: AWS Bedrock (Claude/Llama) with RAG
- Container: Docker on AWS ECS Fargate

**Key Components**:

```python
class AdvisoryEngine:
    def __init__(self):
        self.llm_client = BedrockClient()
        self.translator = MultilingualTranslator()
        self.knowledge_base = KnowledgeBase()
        
    async def generate_advice(self, query: str, 
                             language: str,
                             context: UserContext) -> Advisory:
        # Translate to English if needed
        english_query = await self.translator.translate(
            query, source=language, target='en'
        )
        
        # Retrieve relevant knowledge
        relevant_docs = self.knowledge_base.search(
            english_query, context
        )
        
        # Generate advice using LLM with RAG
        advice = await self.llm_client.generate(
            query=english_query,
            context=relevant_docs,
            temperature=0.3
        )
        
        # Translate back to user language
        localized_advice = await self.translator.translate(
            advice, source='en', target=language
        )
        
        return Advisory(
            query=query,
            advice=localized_advice,
            confidence=self._calculate_confidence(advice),
            language=language
        )
```

**API Endpoints**:
- `POST /api/v1/advisory/ask` - Ask agricultural question
- `POST /api/v1/advisory/voice` - Voice-based query
- `GET /api/v1/advisory/history/{user_id}` - Query history

**Supported Languages**:
Hindi, English, Tamil, Telugu, Kannada, Marathi, Punjabi, Bengali, Gujarati, Malayalam

**Data Dependencies**:
- Agricultural knowledge base (S3 + OpenSearch)
- State-specific crop practices (DynamoDB)
- User interaction history (Aurora)

**Scaling Strategy**:
- LLM request batching for cost optimization
- Response caching for common queries
- Language-specific model routing


### 3.5 User Service

**Responsibility**: User authentication, authorization, and profile management

**Technology Stack**:
- Runtime: Node.js 20 with Express
- Authentication: AWS Cognito
- Container: Docker on AWS ECS Fargate

**Key Components**:

```javascript
class UserService {
    constructor() {
        this.cognito = new CognitoClient();
        this.userRepository = new UserRepository();
    }
    
    async registerUser(userData) {
        // Create Cognito user
        const cognitoUser = await this.cognito.signUp({
            username: userData.phone,
            password: userData.password,
            attributes: {
                phone_number: userData.phone,
                preferred_language: userData.language
            }
        });
        
        // Create user profile
        const profile = await this.userRepository.create({
            cognitoId: cognitoUser.userSub,
            phone: userData.phone,
            language: userData.language,
            state: userData.state,
            district: userData.district
        });
        
        return profile;
    }
}
```

**API Endpoints**:
- `POST /api/v1/users/register` - User registration
- `POST /api/v1/users/login` - User authentication
- `GET /api/v1/users/profile` - Get user profile
- `PUT /api/v1/users/profile` - Update user profile
- `DELETE /api/v1/users/account` - Delete user account

**Data Dependencies**:
- User profiles (Aurora PostgreSQL)
- Authentication tokens (AWS Cognito)
- User preferences (DynamoDB)

**Scaling Strategy**:
- Stateless service design
- JWT token-based authentication
- Read replicas for profile queries

### 3.6 Notification Service

**Responsibility**: Deliver alerts and notifications via multiple channels

**Technology Stack**:
- Runtime: Node.js 20 with Express
- Messaging: AWS SNS, AWS SES
- Container: Docker on AWS ECS Fargate

**Key Components**:

```javascript
class NotificationService {
    constructor() {
        this.snsClient = new SNSClient();
        this.sesClient = new SESClient();
        this.fcmClient = new FCMClient();
    }
    
    async sendNotification(notification) {
        const { userId, type, message, channels } = notification;
        
        // Get user preferences
        const preferences = await this.getPreferences(userId);
        
        // Send via requested channels
        const promises = [];
        
        if (channels.includes('sms') && preferences.smsEnabled) {
            promises.push(this.snsClient.sendSMS(
                preferences.phone, message
            ));
        }
        
        if (channels.includes('push') && preferences.pushEnabled) {
            promises.push(this.fcmClient.send(
                preferences.fcmToken, message
            ));
        }
        
        await Promise.all(promises);
    }
}
```

**API Endpoints**:
- `POST /api/v1/notifications/send` - Send notification
- `GET /api/v1/notifications/preferences/{user_id}` - Get preferences
- `PUT /api/v1/notifications/preferences` - Update preferences

**Notification Types**:
- Price alerts (threshold-based)
- Risk score changes (>20 point change)
- Weather warnings
- Advisory responses

**Scaling Strategy**:
- Event-driven architecture with SQS
- Batch processing for bulk notifications
- Rate limiting per user


## 4. Data Flow Architecture

### 4.1 Price Forecast Data Flow

```
┌─────────────┐
│ Mobile App  │
└──────┬──────┘
       │ 1. Request forecast (crop, mandi, horizon)
       ▼
┌─────────────────┐
│  API Gateway    │
└──────┬──────────┘
       │ 2. Authenticate & route
       ▼
┌─────────────────────┐
│ Price Forecaster    │
│                     │
│ 3. Check cache ─────┼──► Redis Cache
│                     │      (hit: return)
│ 4. Fetch history ───┼──► Timestream DB
│                     │
│ 5. Load model ──────┼──► S3 Model Store
│                     │
│ 6. Generate forecast│
│                     │
│ 7. Cache result ────┼──► Redis Cache
└──────┬──────────────┘
       │ 8. Return forecast
       ▼
┌─────────────┐
│ Mobile App  │
└─────────────┘
```

### 4.2 Weather Risk Scoring Data Flow

```
┌──────────────┐
│ Weather API  │ (IMD)
└──────┬───────┘
       │ 1. Hourly weather updates
       ▼
┌─────────────────────┐
│ Data Ingestion      │
│ Pipeline            │
│                     │
│ 2. Transform & store├──► Timestream DB
└─────────────────────┘
       │ 3. Trigger event
       ▼
┌─────────────────────┐
│ Weather Risk Scorer │
│                     │
│ 4. Fetch weather ───┼──► Timestream DB
│                     │
│ 5. Calculate risk   │
│                     │
│ 6. Check threshold  │
│    (>20 point change)
│                     │
│ 7. Trigger alert ───┼──► Notification Service
└─────────────────────┘
       │ 8. Update cache
       ▼
┌─────────────┐
│ Redis Cache │
└─────────────┘
```

### 4.3 Advisory Query Data Flow

```
┌─────────────┐
│ Mobile App  │
└──────┬──────┘
       │ 1. Voice/text query (regional language)
       ▼
┌─────────────────┐
│  API Gateway    │
└──────┬──────────┘
       │ 2. Route to advisory
       ▼
┌─────────────────────┐
│ Advisory Engine     │
│                     │
│ 3. Translate to EN ─┼──► Translation Service
│                     │
│ 4. Search knowledge ┼──► OpenSearch
│                     │      (RAG retrieval)
│ 5. Generate advice ─┼──► AWS Bedrock (LLM)
│                     │
│ 6. Translate back ──┼──► Translation Service
│                     │
│ 7. Log interaction ─┼──► Aurora DB
└──────┬──────────────┘
       │ 8. Return advice
       ▼
┌─────────────┐
│ Mobile App  │
└─────────────┘
```

### 4.4 Data Ingestion Pipeline

```
┌──────────────┐  ┌──────────────┐  ┌──────────────┐
│ Mandi Price  │  │ Weather API  │  │ Crop Data    │
│ APIs         │  │ (IMD)        │  │ (Govt)       │
└──────┬───────┘  └──────┬───────┘  └──────┬───────┘
       │                 │                 │
       └─────────────────┼─────────────────┘
                         │
                         ▼
              ┌─────────────────────┐
              │ AWS Lambda          │
              │ (Scheduled/Event)   │
              │                     │
              │ 1. Fetch data       │
              │ 2. Validate         │
              │ 3. Transform        │
              └──────┬──────────────┘
                     │
                     ▼
              ┌─────────────────────┐
              │ AWS Kinesis         │
              │ Data Streams        │
              └──────┬──────────────┘
                     │
         ┌───────────┼───────────┐
         │           │           │
         ▼           ▼           ▼
┌──────────────┐ ┌──────────┐ ┌──────────┐
│ Timestream   │ │ S3 Data  │ │ DynamoDB │
│ (Time-series)│ │ Lake     │ │ (Metadata)│
└──────────────┘ └──────────┘ └──────────┘
```


## 5. AI/ML Pipeline Design

### 5.1 ML Pipeline Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    ML Training Pipeline                      │
│                                                              │
│  ┌──────────────┐    ┌──────────────┐    ┌──────────────┐  │
│  │ Data         │    │ Feature      │    │ Model        │  │
│  │ Preparation  │───▶│ Engineering  │───▶│ Training     │  │
│  └──────────────┘    └──────────────┘    └──────────────┘  │
│         │                    │                    │         │
│         ▼                    ▼                    ▼         │
│  ┌──────────────┐    ┌──────────────┐    ┌──────────────┐  │
│  │ S3 Data Lake │    │ SageMaker    │    │ Model        │  │
│  │              │    │ Processing   │    │ Registry     │  │
│  └──────────────┘    └──────────────┘    └──────────────┘  │
│                                                   │         │
│                                                   ▼         │
│                                          ┌──────────────┐   │
│                                          │ Model        │   │
│                                          │ Validation   │   │
│                                          └──────┬───────┘   │
│                                                 │           │
│                                                 ▼           │
│                                          ┌──────────────┐   │
│                                          │ Deployment   │   │
│                                          │ (ECS/Lambda) │   │
│                                          └──────────────┘   │
└─────────────────────────────────────────────────────────────┘
```

### 5.2 Price Forecasting ML Model

**Model Architecture**: Ensemble approach
- **Prophet**: Captures seasonality and trends
- **LSTM**: Captures complex temporal dependencies
- **XGBoost**: Captures feature interactions

**Features**:
- Historical prices (30, 60, 90, 180, 365 days)
- Day of week, month, season
- Festival calendar (affects demand)
- Weather conditions (rainfall, temperature)
- Crop production volumes
- Regional economic indicators
- Transportation costs

**Training Strategy**:
- Weekly retraining on latest data
- Per-crop, per-mandi models for top 100 combinations
- Regional models for less common combinations
- Synthetic data augmentation for sparse data

**Evaluation Metrics**:
- MAPE (Mean Absolute Percentage Error) < 15%
- RMSE (Root Mean Square Error)
- Directional accuracy (up/down prediction)

### 5.3 Weather Risk Scoring ML Model

**Model Architecture**: XGBoost Classifier + Rule-based system

**Features**:
- 14-day weather forecast (rainfall, temp, humidity, wind)
- Crop growth stage
- Soil moisture estimates
- Historical crop loss patterns
- Crop vulnerability profiles

**Risk Categories**:
- 0-30: Low risk (green)
- 31-60: Moderate risk (yellow)
- 61-80: High risk (orange)
- 81-100: Critical risk (red)

**Training Strategy**:
- Trained on historical crop loss data
- Crop-specific models
- Monthly retraining
- Synthetic scenario generation for rare events

**Evaluation Metrics**:
- Precision/Recall for high-risk predictions
- Correlation with actual crop loss events (>0.75)
- False positive rate (<20%)

### 5.4 Demand Prediction ML Model

**Model Architecture**: 
- **Clustering**: K-means for demand cluster identification
- **Forecasting**: Random Forest for demand volume prediction

**Features**:
- Population demographics
- Historical consumption patterns
- Market transaction volumes
- Seasonal trends
- Economic indicators
- Transportation network connectivity

**Training Strategy**:
- Quarterly retraining
- State-level and district-level models
- Transfer learning for new regions

**Evaluation Metrics**:
- Top-3 crop recommendation accuracy (>65%)
- Demand volume MAPE (<20%)
- Cluster stability (Silhouette score >0.5)

### 5.5 Advisory Engine NLP Pipeline

**Model Architecture**: RAG (Retrieval-Augmented Generation)

**Components**:
1. **Query Understanding**: IndicBERT for multilingual intent classification
2. **Retrieval**: OpenSearch with semantic search (embeddings)
3. **Generation**: AWS Bedrock (Claude 3 Sonnet)
4. **Translation**: AWS Translate + custom fine-tuned models

**Knowledge Base**:
- Agricultural best practices (10,000+ documents)
- State-specific crop guides
- Pest and disease management
- Government schemes and subsidies
- FAQ corpus (50,000+ Q&A pairs)

**Training Strategy**:
- Continuous learning from user feedback
- Fine-tuning on agricultural domain corpus
- Human-in-the-loop for quality assurance

**Evaluation Metrics**:
- User satisfaction rating (>4.0/5.0)
- Response relevance (>80%)
- Translation quality (BLEU score >0.6)


## 6. AWS Deployment Architecture

### 6.1 Multi-Region Deployment

```
┌─────────────────────────────────────────────────────────────┐
│                    AWS Global Infrastructure                 │
│                                                              │
│  ┌────────────────────────┐  ┌────────────────────────┐    │
│  │  Primary Region        │  │  DR Region             │    │
│  │  (ap-south-1 Mumbai)   │  │  (ap-south-2 Hyderabad)│    │
│  │                        │  │                        │    │
│  │  ┌──────────────────┐  │  │  ┌──────────────────┐  │    │
│  │  │ VPC              │  │  │  │ VPC              │  │    │
│  │  │                  │  │  │  │                  │  │    │
│  │  │ ┌──────────────┐ │  │  │  │ ┌──────────────┐ │  │    │
│  │  │ │ Public       │ │  │  │  │ │ Public       │ │  │    │
│  │  │ │ Subnets      │ │  │  │  │ │ Subnets      │ │  │    │
│  │  │ │ - ALB        │ │  │  │  │ │ - ALB        │ │  │    │
│  │  │ │ - NAT GW     │ │  │  │  │ │ - NAT GW     │ │  │    │
│  │  │ └──────────────┘ │  │  │  │ └──────────────┘ │  │    │
│  │  │                  │  │  │  │                  │  │    │
│  │  │ ┌──────────────┐ │  │  │  │ ┌──────────────┐ │  │    │
│  │  │ │ Private      │ │  │  │  │ │ Private      │ │  │    │
│  │  │ │ Subnets      │ │  │  │  │ │ Subnets      │ │  │    │
│  │  │ │ - ECS Tasks  │ │  │  │  │ │ - ECS Tasks  │ │  │    │
│  │  │ │ - Lambda     │ │  │  │  │ │ - Lambda     │ │  │    │
│  │  │ └──────────────┘ │  │  │  │ └──────────────┘ │  │    │
│  │  │                  │  │  │  │                  │  │    │
│  │  │ ┌──────────────┐ │  │  │  │ ┌──────────────┐ │  │    │
│  │  │ │ Data         │ │  │  │  │ │ Data         │ │  │    │
│  │  │ │ Subnets      │ │  │  │  │ │ Subnets      │ │  │    │
│  │  │ │ - RDS        │ │  │  │  │ │ - RDS        │ │  │    │
│  │  │ │ - ElastiCache│ │  │  │  │ │ - ElastiCache│ │  │    │
│  │  │ └──────────────┘ │  │  │  │ └──────────────┘ │  │    │
│  │  └──────────────────┘  │  │  └──────────────────┘  │    │
│  └────────────────────────┘  └────────────────────────┘    │
│                                                              │
│  ┌────────────────────────────────────────────────────┐     │
│  │ Global Services                                    │     │
│  │ - Route 53 (DNS, Health Checks)                   │     │
│  │ - CloudFront (CDN)                                 │     │
│  │ - S3 (Cross-region replication)                   │     │
│  │ - DynamoDB Global Tables                          │     │
│  └────────────────────────────────────────────────────┘     │
└─────────────────────────────────────────────────────────────┘
```

### 6.2 Compute Infrastructure

**ECS Fargate Clusters**:
- **API Services Cluster**: Price Forecaster, Risk Scorer, Demand Predictor
- **User Services Cluster**: User Service, Notification Service
- **ML Services Cluster**: Advisory Engine, ML Training Jobs

**Auto-scaling Configuration**:
```yaml
service:
  price_forecaster:
    min_tasks: 3
    max_tasks: 50
    target_cpu: 70%
    target_memory: 80%
    scale_in_cooldown: 300s
    scale_out_cooldown: 60s
    
  advisory_engine:
    min_tasks: 5
    max_tasks: 100
    target_cpu: 60%
    target_requests_per_target: 1000
```

**Lambda Functions**:
- Data ingestion triggers (event-driven)
- Scheduled batch jobs (cron-based)
- API Gateway authorizers
- S3 event processors

### 6.3 Data Storage Architecture

**Amazon Aurora PostgreSQL** (Multi-AZ):
- **Purpose**: User profiles, transactional data
- **Configuration**: 
  - Instance: db.r6g.2xlarge (primary), db.r6g.xlarge (replicas)
  - Read replicas: 2 per region
  - Backup retention: 30 days
  - Encryption: AES-256

**Amazon Timestream**:
- **Purpose**: Time-series data (prices, weather)
- **Configuration**:
  - Memory store retention: 7 days
  - Magnetic store retention: 5 years
  - Automatic data tiering

**Amazon DynamoDB**:
- **Purpose**: User preferences, metadata, cache
- **Configuration**:
  - On-demand capacity mode
  - Global tables for multi-region
  - Point-in-time recovery enabled
  - Encryption at rest

**Amazon S3**:
- **Purpose**: Data lake, ML models, static assets
- **Buckets**:
  - `gramvaani-data-lake-raw`: Raw ingested data
  - `gramvaani-data-lake-processed`: Transformed data
  - `gramvaani-ml-models`: Trained models
  - `gramvaani-static-assets`: Mobile app assets
- **Configuration**:
  - Versioning enabled
  - Cross-region replication
  - Lifecycle policies (transition to Glacier after 90 days)
  - Server-side encryption (SSE-S3)

**Amazon ElastiCache (Redis)**:
- **Purpose**: Application cache, session store
- **Configuration**:
  - Cluster mode enabled
  - 3 shards, 2 replicas per shard
  - Instance: cache.r6g.large
  - Automatic failover

### 6.4 Networking Architecture

**VPC Configuration**:
- CIDR: 10.0.0.0/16
- Availability Zones: 3
- Public Subnets: 10.0.1.0/24, 10.0.2.0/24, 10.0.3.0/24
- Private Subnets: 10.0.11.0/24, 10.0.12.0/24, 10.0.13.0/24
- Data Subnets: 10.0.21.0/24, 10.0.22.0/24, 10.0.23.0/24

**Load Balancing**:
- **Application Load Balancer** (ALB):
  - Internet-facing for API Gateway
  - SSL/TLS termination
  - Health checks every 30 seconds
  - Connection draining: 300 seconds

**API Gateway**:
- REST API with regional endpoint
- Request throttling: 10,000 RPS burst, 5,000 RPS steady
- API keys for third-party integrations
- CloudWatch logging enabled

**CloudFront Distribution**:
- Origin: S3 (static assets), ALB (API)
- Edge locations: All global locations
- Cache behavior: TTL 86400s for static, 300s for API
- Compression enabled


## 7. Scalability Considerations

### 7.1 Horizontal Scaling Strategy

**Microservices Scaling**:
- Each service scales independently based on metrics
- Auto-scaling policies per service
- Load balancing across service instances
- Stateless service design for easy scaling

**Database Scaling**:
- Aurora read replicas for read-heavy workloads
- DynamoDB on-demand scaling
- Timestream automatic scaling
- ElastiCache cluster mode for distributed caching

**Geographic Scaling**:
- Multi-region deployment (Mumbai primary, Hyderabad DR)
- Route 53 latency-based routing
- CloudFront edge caching
- Regional data partitioning

### 7.2 Performance Optimization

**Caching Strategy**:
```
┌─────────────────────────────────────────────────────┐
│ Cache Layer Hierarchy                               │
│                                                     │
│ L1: Application Memory Cache (5 min TTL)           │
│     - Frequently accessed models                   │
│     - User session data                            │
│                                                     │
│ L2: Redis Cluster (1 hour TTL)                     │
│     - Price forecasts                              │
│     - Risk scores                                  │
│     - Demand predictions                           │
│                                                     │
│ L3: CloudFront CDN (24 hour TTL)                   │
│     - Static assets                                │
│     - API responses (public data)                  │
│                                                     │
│ L4: Database (Source of truth)                     │
│     - Timestream, Aurora, DynamoDB                 │
└─────────────────────────────────────────────────────┘
```

**Query Optimization**:
- Database indexing on frequently queried fields
- Materialized views for complex aggregations
- Query result pagination (max 100 records per page)
- Asynchronous processing for heavy computations

**Data Partitioning**:
- Time-based partitioning for historical data
- Geographic partitioning by state
- Crop-based partitioning for predictions
- Sharding strategy for high-volume tables

### 7.3 Load Management

**Rate Limiting**:
- API Gateway: 1000 req/hour (free tier), 10000 req/hour (paid)
- Per-user limits: 100 req/hour
- Burst capacity: 2x steady-state rate
- Exponential backoff for retries

**Request Prioritization**:
- Critical: Risk alerts, weather warnings (P0)
- High: Price forecasts, advisory queries (P1)
- Medium: Historical data queries (P2)
- Low: Analytics, reports (P3)

**Circuit Breaker Pattern**:
- Failure threshold: 50% error rate over 1 minute
- Open circuit duration: 30 seconds
- Half-open state: Allow 10% traffic for testing
- Fallback: Cached data or degraded service

### 7.4 Capacity Planning

**User Growth Projections**:
- Phase 1 (0-6 months): 100,000 users
- Phase 2 (6-12 months): 500,000 users
- Phase 3 (12-18 months): 1,000,000 users
- Steady state: 10,000,000 users

**Resource Allocation**:
```
Service              | Phase 1 | Phase 2 | Phase 3 | Steady
---------------------|---------|---------|---------|--------
ECS Tasks (total)    | 20      | 100     | 200     | 500
Aurora vCPUs         | 8       | 16      | 32      | 64
Redis Nodes          | 6       | 12      | 18      | 30
Lambda Concurrent    | 100     | 500     | 1000    | 5000
S3 Storage (TB)      | 1       | 5       | 10      | 50
Timestream (GB/day)  | 10      | 50      | 100     | 500
```


## 8. Security Architecture

### 8.1 Security Layers

```
┌─────────────────────────────────────────────────────────────┐
│ Layer 7: Application Security                               │
│ - Input validation, output encoding                         │
│ - SQL injection prevention                                  │
│ - XSS protection                                            │
└─────────────────────────────────────────────────────────────┘
                            │
┌─────────────────────────────────────────────────────────────┐
│ Layer 6: Authentication & Authorization                     │
│ - AWS Cognito (JWT tokens)                                  │
│ - Role-based access control (RBAC)                          │
│ - API key management                                        │
└─────────────────────────────────────────────────────────────┘
                            │
┌─────────────────────────────────────────────────────────────┐
│ Layer 5: API Security                                       │
│ - AWS WAF (rate limiting, IP filtering)                     │
│ - API Gateway throttling                                    │
│ - Request/response validation                               │
└─────────────────────────────────────────────────────────────┘
                            │
┌─────────────────────────────────────────────────────────────┐
│ Layer 4: Network Security                                   │
│ - VPC isolation                                             │
│ - Security groups (least privilege)                         │
│ - NACLs (network ACLs)                                      │
│ - Private subnets for data/compute                          │
└─────────────────────────────────────────────────────────────┘
                            │
┌─────────────────────────────────────────────────────────────┐
│ Layer 3: Data Security                                      │
│ - Encryption at rest (AES-256)                              │
│ - Encryption in transit (TLS 1.3)                           │
│ - AWS KMS for key management                                │
│ - Database encryption                                       │
└─────────────────────────────────────────────────────────────┘
                            │
┌─────────────────────────────────────────────────────────────┐
│ Layer 2: Infrastructure Security                            │
│ - IAM roles and policies                                    │
│ - Secrets Manager for credentials                           │
│ - CloudTrail for audit logging                              │
│ - GuardDuty for threat detection                            │
└─────────────────────────────────────────────────────────────┘
                            │
┌─────────────────────────────────────────────────────────────┐
│ Layer 1: Physical Security                                  │
│ - AWS data center security                                  │
│ - Compliance certifications (ISO 27001, SOC 2)              │
└─────────────────────────────────────────────────────────────┘
```

### 8.2 Authentication & Authorization

**AWS Cognito Configuration**:
```json
{
  "userPool": {
    "mfaConfiguration": "OPTIONAL",
    "passwordPolicy": {
      "minimumLength": 8,
      "requireUppercase": true,
      "requireLowercase": true,
      "requireNumbers": true,
      "requireSymbols": false
    },
    "accountRecoverySetting": {
      "recoveryMechanisms": [
        {"name": "verified_phone_number", "priority": 1}
      ]
    }
  }
}
```

**JWT Token Structure**:
```json
{
  "sub": "user-uuid",
  "cognito:groups": ["farmers", "premium"],
  "phone_number": "+91XXXXXXXXXX",
  "preferred_language": "hi",
  "state": "punjab",
  "exp": 1234567890,
  "iat": 1234567890
}
```

**RBAC Roles**:
- **Farmer** (default): Access to all core features
- **Premium Farmer**: Higher rate limits, priority support
- **Agricultural Officer**: Read-only analytics access
- **Admin**: Full system access
- **API Partner**: Third-party integration access

### 8.3 Data Protection

**Encryption Strategy**:
- **At Rest**: 
  - RDS: AES-256 encryption
  - S3: SSE-S3 or SSE-KMS
  - DynamoDB: AWS-managed keys
  - EBS volumes: Encrypted
  
- **In Transit**:
  - TLS 1.3 for all API communications
  - Certificate management via ACM
  - HTTPS-only CloudFront distributions

**Data Privacy Compliance**:
- Personal data minimization
- User consent management
- Right to data deletion (GDPR-style)
- Data retention policies:
  - User profiles: Until account deletion
  - Query logs: 90 days
  - Analytics data: 2 years (anonymized)
  - Audit logs: 7 years

**PII Handling**:
- Phone numbers: Hashed for analytics
- Location data: Aggregated to district level
- Query content: Encrypted, not used for training without consent
- No sharing with third parties without explicit consent

### 8.4 Security Monitoring

**AWS Security Services**:
- **CloudTrail**: All API calls logged
- **GuardDuty**: Threat detection
- **Security Hub**: Centralized security findings
- **Config**: Resource compliance monitoring
- **Inspector**: Vulnerability scanning

**Security Metrics**:
- Failed authentication attempts
- Unusual API access patterns
- Data access anomalies
- DDoS attack indicators
- Vulnerability scan results

**Incident Response**:
1. Detection: Automated alerts via CloudWatch
2. Triage: Security team notified within 5 minutes
3. Containment: Isolate affected resources
4. Investigation: Root cause analysis
5. Remediation: Apply fixes, update policies
6. Post-mortem: Document lessons learned


## 9. Mobile Application Design

### 9.1 Mobile Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    Mobile Application                        │
│                                                              │
│  ┌────────────────────────────────────────────────────┐     │
│  │ Presentation Layer                                 │     │
│  │ - React Native UI Components                      │     │
│  │ - Navigation (React Navigation)                   │     │
│  │ - State Management (Redux)                        │     │
│  └────────────────────────────────────────────────────┘     │
│                          │                                   │
│  ┌────────────────────────────────────────────────────┐     │
│  │ Business Logic Layer                               │     │
│  │ - API Client (Axios)                              │     │
│  │ - Data Transformation                             │     │
│  │ - Validation Logic                                │     │
│  └────────────────────────────────────────────────────┘     │
│                          │                                   │
│  ┌────────────────────────────────────────────────────┐     │
│  │ Data Layer                                         │     │
│  │ - Local Storage (AsyncStorage)                    │     │
│  │ - Offline Cache (Redux Persist)                   │     │
│  │ - SQLite (for structured data)                    │     │
│  └────────────────────────────────────────────────────┘     │
│                          │                                   │
│  ┌────────────────────────────────────────────────────┐     │
│  │ Platform Services                                  │     │
│  │ - Push Notifications (FCM)                        │     │
│  │ - Voice Input (React Native Voice)               │     │
│  │ - Location Services                               │     │
│  │ - Network Detection                               │     │
│  └────────────────────────────────────────────────────┘     │
└─────────────────────────────────────────────────────────────┘
```

### 9.2 Offline Capabilities

**Offline-First Strategy**:
- Cache last 7 days of price forecasts
- Store user's saved mandis and crops
- Queue queries when offline, sync when online
- Local storage of advisory history

**Data Sync Strategy**:
```javascript
class OfflineManager {
    async syncData() {
        if (!this.isOnline()) {
            return;
        }
        
        // Sync queued queries
        await this.syncQueuedQueries();
        
        // Refresh cached forecasts
        await this.refreshForecasts();
        
        // Upload pending feedback
        await this.syncFeedback();
    }
    
    async handleOfflineRequest(request) {
        // Check cache first
        const cached = await this.cache.get(request.key);
        if (cached && !this.isStale(cached)) {
            return cached;
        }
        
        // Queue for later
        await this.queue.add(request);
        
        // Return cached data with staleness indicator
        return {
            ...cached,
            isStale: true,
            message: "Showing cached data. Will update when online."
        };
    }
}
```

**Storage Limits**:
- Maximum offline cache: 50 MB
- Automatic cleanup of data older than 30 days
- User can manually clear cache

### 9.3 Performance Optimization

**Bundle Size Optimization**:
- Code splitting by feature
- Lazy loading of non-critical components
- Image optimization (WebP format, progressive loading)
- Tree shaking to remove unused code

**Network Optimization**:
- Request batching (combine multiple API calls)
- Response compression (gzip)
- Image lazy loading
- Prefetching for predicted user actions

**Rendering Optimization**:
- Virtual lists for long scrollable content
- Memoization of expensive computations
- Debouncing of user inputs
- Optimistic UI updates

### 9.4 Multilingual Support

**Language Implementation**:
- i18n library: react-i18next
- Language files stored locally
- Dynamic language switching
- RTL support for applicable languages

**Supported Languages**:
1. Hindi (hi)
2. English (en)
3. Tamil (ta)
4. Telugu (te)
5. Kannada (kn)
6. Marathi (mr)
7. Punjabi (pa)
8. Bengali (bn)
9. Gujarati (gu)
10. Malayalam (ml)

**Voice Input**:
- Speech-to-text using device native APIs
- Language-specific voice models
- Fallback to text input if voice unavailable


## 10. Monitoring and Observability

### 10.1 Monitoring Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    Monitoring Stack                          │
│                                                              │
│  ┌────────────────────────────────────────────────────┐     │
│  │ Metrics Collection                                 │     │
│  │ - CloudWatch Metrics                              │     │
│  │ - Custom Application Metrics                      │     │
│  │ - Container Insights                              │     │
│  └────────────────────────────────────────────────────┘     │
│                          │                                   │
│  ┌────────────────────────────────────────────────────┐     │
│  │ Logging                                            │     │
│  │ - CloudWatch Logs                                 │     │
│  │ - Structured JSON logging                         │     │
│  │ - Log aggregation and search                      │     │
│  └────────────────────────────────────────────────────┘     │
│                          │                                   │
│  ┌────────────────────────────────────────────────────┐     │
│  │ Distributed Tracing                                │     │
│  │ - AWS X-Ray                                       │     │
│  │ - Request flow visualization                      │     │
│  │ - Performance bottleneck identification           │     │
│  └────────────────────────────────────────────────────┘     │
│                          │                                   │
│  ┌────────────────────────────────────────────────────┐     │
│  │ Alerting                                           │     │
│  │ - CloudWatch Alarms                               │     │
│  │ - SNS notifications                               │     │
│  │ - PagerDuty integration                           │     │
│  └────────────────────────────────────────────────────┘     │
│                          │                                   │
│  ┌────────────────────────────────────────────────────┐     │
│  │ Dashboards                                         │     │
│  │ - CloudWatch Dashboards                           │     │
│  │ - Grafana (optional)                              │     │
│  │ - Real-time metrics visualization                 │     │
│  └────────────────────────────────────────────────────┘     │
└─────────────────────────────────────────────────────────────┘
```

### 10.2 Key Metrics

**Application Metrics**:
- Request rate (requests per second)
- Response time (p50, p95, p99)
- Error rate (4xx, 5xx)
- Availability (uptime percentage)

**Business Metrics**:
- Active users (DAU, MAU)
- Forecast requests per day
- Advisory queries per day
- User retention rate
- Feature adoption rate

**Infrastructure Metrics**:
- CPU utilization
- Memory utilization
- Network throughput
- Disk I/O
- Database connections

**ML Model Metrics**:
- Prediction accuracy
- Model inference latency
- Model drift detection
- Training job duration
- Feature importance changes

### 10.3 Alerting Strategy

**Critical Alerts** (P0 - Immediate response):
- Service downtime (>1 minute)
- Error rate >10%
- Database connection failures
- Security incidents

**High Priority Alerts** (P1 - Response within 15 minutes):
- Response time >5 seconds (p95)
- CPU utilization >90%
- Memory utilization >90%
- Failed deployments

**Medium Priority Alerts** (P2 - Response within 1 hour):
- Model accuracy degradation >10%
- Cache hit rate <70%
- Disk utilization >80%

**Low Priority Alerts** (P3 - Response within 24 hours):
- Unusual traffic patterns
- Slow queries
- Certificate expiration warnings (>30 days)

### 10.4 Logging Strategy

**Log Levels**:
- ERROR: Application errors, exceptions
- WARN: Degraded performance, retries
- INFO: Important business events
- DEBUG: Detailed diagnostic information

**Structured Logging Format**:
```json
{
  "timestamp": "2026-02-15T10:30:00Z",
  "level": "INFO",
  "service": "price-forecaster",
  "traceId": "abc123",
  "userId": "user-456",
  "event": "forecast_generated",
  "crop": "wheat",
  "mandi": "delhi",
  "duration_ms": 234,
  "status": "success"
}
```

**Log Retention**:
- Application logs: 30 days
- Audit logs: 7 years
- Access logs: 90 days
- Debug logs: 7 days


## 11. Disaster Recovery and Business Continuity

### 11.1 Backup Strategy

**Database Backups**:
- **Aurora**: Automated daily backups, 30-day retention
- **DynamoDB**: Point-in-time recovery enabled
- **Timestream**: Automatic backup to S3
- **S3**: Cross-region replication to DR region

**Backup Schedule**:
```
Service          | Frequency    | Retention | Type
-----------------|--------------|-----------|------------------
Aurora           | Every 6 hrs  | 30 days   | Automated
DynamoDB         | Continuous   | 35 days   | Point-in-time
S3 Data Lake     | Real-time    | Indefinite| Cross-region
ML Models        | On update    | All versions| Versioned
Configuration    | On change    | 90 days   | Git + S3
```

### 11.2 Disaster Recovery Plan

**RTO and RPO Targets**:
- Recovery Time Objective (RTO): 4 hours
- Recovery Point Objective (RPO): 1 hour

**DR Architecture**:
- **Primary Region**: ap-south-1 (Mumbai)
- **DR Region**: ap-south-2 (Hyderabad)
- **Failover Strategy**: Active-Passive with automated failover

**Failover Procedure**:
1. **Detection** (0-5 minutes):
   - Route 53 health checks detect primary region failure
   - CloudWatch alarms trigger SNS notifications
   
2. **Decision** (5-15 minutes):
   - On-call engineer validates the incident
   - Decision to failover made
   
3. **Failover** (15-60 minutes):
   - Route 53 updates DNS to point to DR region
   - Database read replicas promoted to primary
   - ECS services scaled up in DR region
   
4. **Validation** (60-90 minutes):
   - Health checks confirm DR region operational
   - Smoke tests validate critical functionality
   
5. **Communication** (90-120 minutes):
   - Status page updated
   - User communication sent
   
6. **Monitoring** (Ongoing):
   - Enhanced monitoring of DR region
   - Plan for failback to primary region

### 11.3 High Availability Design

**Service Redundancy**:
- Multi-AZ deployment for all services
- Minimum 2 instances per service
- Load balancing across availability zones
- Automatic health checks and replacement

**Database High Availability**:
- Aurora: Multi-AZ with automatic failover
- DynamoDB: Multi-region replication
- ElastiCache: Multi-AZ with automatic failover
- Timestream: Built-in redundancy

**Network Resilience**:
- Multiple NAT Gateways across AZs
- VPC peering for cross-region communication
- Route 53 health checks with failover routing
- CloudFront for edge caching and DDoS protection


## 12. Cost Optimization

### 12.1 Cost Structure

**Estimated Monthly Costs** (Phase 3 - 1M users):

```
Service                  | Monthly Cost (USD) | Optimization Strategy
-------------------------|-------------------|------------------------
ECS Fargate              | $3,000           | Spot instances, right-sizing
Aurora PostgreSQL        | $1,500           | Reserved instances
DynamoDB                 | $800             | On-demand, auto-scaling
Timestream               | $1,200           | Data tiering
S3                       | $500             | Lifecycle policies
ElastiCache              | $600             | Reserved instances
Lambda                   | $300             | Memory optimization
API Gateway              | $400             | Caching
CloudFront               | $200             | Compression
Data Transfer            | $800             | Regional optimization
Bedrock (LLM)            | $2,000           | Request batching, caching
Other Services           | $700             | Various
-------------------------|-------------------|------------------------
Total                    | $12,000          |
Cost per user            | $0.012           |
```

### 12.2 Cost Optimization Strategies

**Compute Optimization**:
- Use Fargate Spot for non-critical workloads (70% savings)
- Right-size containers based on actual usage
- Auto-scaling to match demand
- Reserved capacity for baseline load

**Storage Optimization**:
- S3 Intelligent-Tiering for data lake
- Lifecycle policies to move old data to Glacier
- Compress data before storage
- Delete temporary data after processing

**Database Optimization**:
- Aurora Serverless v2 for variable workloads
- DynamoDB on-demand for unpredictable traffic
- Read replicas only where needed
- Archive old data to S3

**Network Optimization**:
- CloudFront caching to reduce origin requests
- VPC endpoints to avoid NAT Gateway costs
- Regional data processing to minimize transfer
- Compression for API responses

**ML Cost Optimization**:
- Batch inference for non-real-time predictions
- Model caching to reduce LLM calls
- Use smaller models where accuracy permits
- Pre-compute forecasts for popular queries

### 12.3 Cost Monitoring

**Cost Allocation Tags**:
- Environment (prod, staging, dev)
- Service (price-forecaster, advisory-engine, etc.)
- Team (ml-team, backend-team, etc.)
- Feature (forecasting, risk-scoring, etc.)

**Budget Alerts**:
- Alert at 80% of monthly budget
- Alert at 100% of monthly budget
- Daily cost anomaly detection
- Weekly cost review reports


## 13. Development and Deployment

### 13.1 CI/CD Pipeline

```
┌─────────────────────────────────────────────────────────────┐
│                    CI/CD Pipeline                            │
│                                                              │
│  ┌──────────┐    ┌──────────┐    ┌──────────┐             │
│  │  Code    │    │  Build   │    │  Test    │             │
│  │  Commit  │───▶│  Docker  │───▶│  Unit &  │             │
│  │  (Git)   │    │  Image   │    │  Integration│           │
│  └──────────┘    └──────────┘    └──────────┘             │
│                                         │                    │
│                                         ▼                    │
│                                  ┌──────────┐               │
│                                  │ Security │               │
│                                  │ Scan     │               │
│                                  └──────────┘               │
│                                         │                    │
│                                         ▼                    │
│                                  ┌──────────┐               │
│                                  │ Push to  │               │
│                                  │ ECR      │               │
│                                  └──────────┘               │
│                                         │                    │
│                  ┌──────────────────────┼──────────────┐    │
│                  │                      │              │    │
│                  ▼                      ▼              ▼    │
│           ┌──────────┐          ┌──────────┐   ┌──────────┐│
│           │  Deploy  │          │  Deploy  │   │  Deploy  ││
│           │  to Dev  │          │  to      │   │  to Prod ││
│           │          │          │  Staging │   │          ││
│           └──────────┘          └──────────┘   └──────────┘│
│                                         │              │    │
│                                         ▼              ▼    │
│                                  ┌──────────┐   ┌──────────┐│
│                                  │ Smoke    │   │ Smoke    ││
│                                  │ Tests    │   │ Tests    ││
│                                  └──────────┘   └──────────┘│
└─────────────────────────────────────────────────────────────┘
```

**Pipeline Stages**:

1. **Source**: GitHub repository with branch protection
2. **Build**: Docker image build with multi-stage builds
3. **Test**: 
   - Unit tests (Jest, PyTest)
   - Integration tests
   - Code coverage (minimum 80%)
4. **Security Scan**:
   - Container vulnerability scanning (Trivy)
   - Dependency scanning (Snyk)
   - SAST (Static Application Security Testing)
5. **Push**: Push to Amazon ECR
6. **Deploy**:
   - Dev: Automatic on merge to develop
   - Staging: Automatic on merge to main
   - Production: Manual approval required
7. **Validation**: Smoke tests and health checks

**Tools**:
- CI/CD: GitHub Actions
- Container Registry: Amazon ECR
- Infrastructure as Code: Terraform
- Configuration Management: AWS Systems Manager Parameter Store

### 13.2 Environment Strategy

**Environments**:

```
Environment | Purpose              | Data        | Scale
------------|---------------------|-------------|-------
Dev         | Development testing | Synthetic   | 10%
Staging     | Pre-production      | Anonymized  | 50%
Production  | Live users          | Real        | 100%
```

**Environment Isolation**:
- Separate AWS accounts per environment
- Separate VPCs and subnets
- Separate databases and caches
- Separate API keys and secrets

### 13.3 Deployment Strategy

**Rolling Deployment**:
- Deploy to 10% of instances
- Monitor for 10 minutes
- If healthy, deploy to 50%
- Monitor for 10 minutes
- If healthy, deploy to 100%
- Automatic rollback on errors

**Blue-Green Deployment** (for major releases):
- Deploy new version to green environment
- Run comprehensive tests
- Switch traffic to green
- Keep blue as fallback for 24 hours

**Canary Deployment** (for ML models):
- Route 5% of traffic to new model
- Monitor accuracy and performance
- Gradually increase to 100% over 7 days
- Automatic rollback if metrics degrade

### 13.4 Infrastructure as Code

**Terraform Structure**:
```
terraform/
├── modules/
│   ├── networking/
│   ├── compute/
│   ├── database/
│   ├── storage/
│   └── security/
├── environments/
│   ├── dev/
│   ├── staging/
│   └── production/
└── global/
    ├── iam/
    └── route53/
```

**Version Control**:
- All infrastructure code in Git
- Pull request reviews required
- Terraform state in S3 with locking (DynamoDB)
- Automated terraform plan on PRs


## 14. Testing Strategy

### 14.1 Testing Pyramid

```
                    ┌─────────────┐
                    │   Manual    │
                    │   Testing   │
                    └─────────────┘
                  ┌─────────────────┐
                  │   E2E Tests     │
                  │   (Selenium)    │
                  └─────────────────┘
              ┌───────────────────────┐
              │  Integration Tests    │
              │  (API, Database)      │
              └───────────────────────┘
          ┌───────────────────────────────┐
          │      Unit Tests               │
          │  (Jest, PyTest, JUnit)        │
          └───────────────────────────────┘
```

### 14.2 Test Types

**Unit Tests** (Target: 80% coverage):
- Individual function and class testing
- Mocked external dependencies
- Fast execution (<5 minutes for full suite)
- Run on every commit

**Integration Tests** (Target: 60% coverage):
- API endpoint testing
- Database interaction testing
- Service-to-service communication
- Run on every PR

**End-to-End Tests** (Target: Critical paths):
- User journey testing
- Mobile app flows
- Cross-service workflows
- Run before deployment to staging

**Performance Tests**:
- Load testing (JMeter, Locust)
- Stress testing
- Endurance testing
- Run weekly and before major releases

**Security Tests**:
- Penetration testing (quarterly)
- Vulnerability scanning (continuous)
- Dependency audits (weekly)
- OWASP Top 10 validation

**ML Model Tests**:
- Accuracy validation
- Bias detection
- Drift monitoring
- A/B testing for model updates

### 14.3 Test Data Management

**Test Data Strategy**:
- Synthetic data generation for dev/staging
- Anonymized production data (with consent)
- Separate test data repositories
- Automated test data refresh

**Data Privacy in Testing**:
- No real PII in non-production environments
- Automated PII scrubbing tools
- Synthetic user profiles
- Masked phone numbers and locations


## 15. API Design

### 15.1 RESTful API Conventions

**Base URL**: `https://api.gramvaani.in/v1`

**Authentication**: Bearer token (JWT) in Authorization header
```
Authorization: Bearer <jwt_token>
```

**Request/Response Format**: JSON

**HTTP Methods**:
- GET: Retrieve resources
- POST: Create resources or trigger actions
- PUT: Update resources (full replacement)
- PATCH: Partial update
- DELETE: Remove resources

**Status Codes**:
- 200: Success
- 201: Created
- 400: Bad Request
- 401: Unauthorized
- 403: Forbidden
- 404: Not Found
- 429: Too Many Requests
- 500: Internal Server Error
- 503: Service Unavailable

### 15.2 API Endpoints

**Price Forecasting**:
```
POST /api/v1/price/forecast
Request:
{
  "crop": "wheat",
  "mandi": "delhi",
  "horizon_days": 14
}

Response:
{
  "crop": "wheat",
  "mandi": "delhi",
  "forecasts": [
    {
      "date": "2026-02-16",
      "predicted_price": 2150,
      "confidence_interval": {
        "lower": 2100,
        "upper": 2200
      }
    }
  ],
  "metadata": {
    "model_version": "v2.3",
    "generated_at": "2026-02-15T10:30:00Z"
  }
}
```

**Weather Risk Scoring**:
```
POST /api/v1/risk/calculate
Request:
{
  "location": {
    "state": "punjab",
    "district": "ludhiana"
  },
  "crop": "wheat"
}

Response:
{
  "risk_score": 45,
  "risk_level": "moderate",
  "factors": {
    "rainfall_risk": 30,
    "temperature_risk": 50,
    "humidity_risk": 40,
    "wind_risk": 20
  },
  "recommendations": [
    "Monitor weather updates daily",
    "Ensure proper drainage in fields"
  ],
  "valid_until": "2026-02-16T10:30:00Z"
}
```

**Demand Prediction**:
```
POST /api/v1/demand/predict
Request:
{
  "region": "punjab",
  "season": "rabi"
}

Response:
{
  "region": "punjab",
  "season": "rabi",
  "top_crops": [
    {
      "crop": "wheat",
      "demand_score": 95,
      "estimated_volume_tons": 50000
    },
    {
      "crop": "mustard",
      "demand_score": 78,
      "estimated_volume_tons": 15000
    }
  ],
  "demand_clusters": [
    {
      "cluster_id": "north-punjab",
      "districts": ["ludhiana", "jalandhar"],
      "primary_crops": ["wheat", "rice"]
    }
  ]
}
```

**Advisory Engine**:
```
POST /api/v1/advisory/ask
Request:
{
  "query": "मेरी गेहूं की फसल में पीले धब्बे आ रहे हैं",
  "language": "hi",
  "context": {
    "crop": "wheat",
    "growth_stage": "flowering",
    "state": "punjab"
  }
}

Response:
{
  "query": "मेरी गेहूं की फसल में पीले धब्बे आ रहे हैं",
  "advice": "यह पीला रतुआ रोग हो सकता है...",
  "confidence": 0.92,
  "language": "hi",
  "sources": [
    "Punjab Agricultural University Guidelines"
  ],
  "related_queries": [
    "गेहूं में रतुआ रोग का इलाज",
    "गेहूं की बीमारियां"
  ]
}
```

### 15.3 Rate Limiting

**Rate Limit Headers**:
```
X-RateLimit-Limit: 1000
X-RateLimit-Remaining: 999
X-RateLimit-Reset: 1644926400
```

**Rate Limit Tiers**:
- Free: 1,000 requests/hour
- Premium: 10,000 requests/hour
- Enterprise: Custom limits

### 15.4 API Versioning

**Strategy**: URL-based versioning
- Current: `/v1/`
- Future: `/v2/`

**Deprecation Policy**:
- 6 months notice before deprecation
- Sunset header in responses
- Migration guide provided


## 16. Data Pipeline Design

### 16.1 Data Ingestion Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                  External Data Sources                       │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐   │
│  │  Mandi   │  │ Weather  │  │   Crop   │  │  Market  │   │
│  │  APIs    │  │   APIs   │  │   Data   │  │   Data   │   │
│  └────┬─────┘  └────┬─────┘  └────┬─────┘  └────┬─────┘   │
└───────┼─────────────┼─────────────┼─────────────┼──────────┘
        │             │             │             │
        └─────────────┼─────────────┼─────────────┘
                      │             │
                      ▼             ▼
            ┌─────────────────────────────┐
            │  AWS Lambda (Schedulers)    │
            │  - Hourly: Weather data     │
            │  - Daily: Mandi prices      │
            │  - Weekly: Crop statistics  │
            └──────────┬──────────────────┘
                       │
                       ▼
            ┌─────────────────────────────┐
            │  Data Validation Layer      │
            │  - Schema validation        │
            │  - Quality checks           │
            │  - Deduplication            │
            └──────────┬──────────────────┘
                       │
                       ▼
            ┌─────────────────────────────┐
            │  AWS Kinesis Data Streams   │
            │  - Real-time streaming      │
            │  - Buffering                │
            └──────────┬──────────────────┘
                       │
        ┌──────────────┼──────────────┐
        │              │              │
        ▼              ▼              ▼
┌──────────────┐ ┌──────────┐ ┌──────────────┐
│ Kinesis      │ │ Kinesis  │ │ Lambda       │
│ Firehose     │ │ Analytics│ │ Consumers    │
│ (to S3)      │ │          │ │              │
└──────────────┘ └──────────┘ └──────────────┘
        │              │              │
        ▼              ▼              ▼
┌──────────────┐ ┌──────────┐ ┌──────────────┐
│ S3 Data Lake │ │ Real-time│ │ Timestream   │
│ (Raw)        │ │ Alerts   │ │ DynamoDB     │
└──────────────┘ └──────────┘ └──────────────┘
```

### 16.2 ETL Pipeline

**Extract**:
- Scheduled Lambda functions fetch data from APIs
- API Gateway webhooks for push-based data
- S3 event triggers for file uploads

**Transform**:
- AWS Glue jobs for batch processing
- Lambda for lightweight transformations
- Data quality checks and validation
- Schema normalization

**Load**:
- Timestream for time-series data
- Aurora for relational data
- DynamoDB for key-value data
- S3 for data lake storage

**Data Quality Checks**:
```python
class DataQualityValidator:
    def validate_price_data(self, data):
        checks = [
            self.check_completeness(data, required_fields=['crop', 'mandi', 'price', 'date']),
            self.check_range(data['price'], min=0, max=100000),
            self.check_date_format(data['date']),
            self.check_duplicates(data),
            self.check_outliers(data['price'], threshold=3)
        ]
        return all(checks)
```

### 16.3 Data Lake Organization

**S3 Bucket Structure**:
```
gramvaani-data-lake/
├── raw/
│   ├── mandi-prices/
│   │   └── year=2026/month=02/day=15/
│   ├── weather/
│   │   └── year=2026/month=02/day=15/
│   └── crop-data/
│       └── year=2026/month=02/
├── processed/
│   ├── mandi-prices-cleaned/
│   ├── weather-aggregated/
│   └── crop-features/
├── curated/
│   ├── training-datasets/
│   ├── feature-store/
│   └── analytics/
└── models/
    ├── price-forecaster/
    │   └── v2.3/
    ├── risk-scorer/
    │   └── v1.5/
    └── demand-predictor/
        └── v1.2/
```

**Data Partitioning Strategy**:
- Time-based: year/month/day for time-series data
- Geographic: state/district for location data
- Crop-based: crop_type for agricultural data

**Data Lifecycle**:
- Raw data: 90 days in S3 Standard
- Processed data: 1 year in S3 Standard
- Historical data: Transition to S3 Glacier after 1 year
- Archived data: S3 Deep Archive after 3 years


## 17. System Limitations and Trade-offs

### 17.1 Technical Limitations

**Data Limitations**:
- **Public Data Dependency**: Accuracy limited by quality of public datasets
  - Mitigation: Synthetic data augmentation, multiple data source validation
- **Data Freshness**: Some government data updated weekly/monthly, not real-time
  - Mitigation: Clearly communicate data staleness to users
- **Geographic Coverage**: Data availability varies by state
  - Mitigation: Use regional models and synthetic data for sparse areas

**Model Limitations**:
- **Forecast Accuracy**: Price forecasts have 15-20% MAPE
  - Trade-off: Acceptable for decision support, not financial guarantees
- **Weather Dependency**: Risk scores depend on weather forecast accuracy
  - Mitigation: Use ensemble weather models, provide confidence intervals
- **Cold Start Problem**: New mandis/crops have limited historical data
  - Mitigation: Transfer learning from similar regions/crops

**Infrastructure Limitations**:
- **Latency**: 3-5 second response times for complex queries
  - Trade-off: Acceptable for mobile use, not suitable for real-time trading
- **Offline Capability**: Limited to cached data (7 days)
  - Trade-off: Balances functionality with storage constraints
- **Concurrent Users**: Designed for 10M users, not unlimited scale
  - Mitigation: Auto-scaling with cost controls

### 17.2 Business Limitations

**Language Support**:
- Limited to 10 major Indian languages
- Regional dialects not fully supported
- Trade-off: Covers 90% of target users, full dialect support cost-prohibitive

**Advisory Quality**:
- AI-generated advice may not cover all edge cases
- Not a replacement for agricultural experts
- Mitigation: Confidence scores, expert escalation for low-confidence queries

**Data Privacy**:
- Requires user location for accurate predictions
- Trade-off: Functionality vs. privacy, user consent required

### 17.3 Scalability Trade-offs

**Cost vs. Performance**:
- Aggressive caching reduces costs but may serve stale data
- Trade-off: 1-hour cache TTL balances freshness and cost

**Accuracy vs. Speed**:
- Simpler models for real-time predictions
- Complex ensemble models for batch predictions
- Trade-off: 5% accuracy loss for 10x speed improvement

**Coverage vs. Quality**:
- Synthetic data enables nationwide coverage
- May reduce accuracy in data-sparse regions
- Trade-off: 80% accuracy with full coverage vs. 95% accuracy with limited coverage

### 17.4 Security Trade-offs

**Convenience vs. Security**:
- Phone-based authentication (no email required)
- Trade-off: Easier for rural users, but phone numbers can be recycled
- Mitigation: Account verification, activity monitoring

**Performance vs. Encryption**:
- End-to-end encryption adds latency
- Trade-off: TLS for transit, encryption at rest, no E2E encryption
- Justification: Non-sensitive agricultural data, performance priority

### 17.5 Known Issues and Future Improvements

**Current Limitations**:
1. No real-time market integration (planned for v2.0)
2. Limited IoT sensor support (planned for v3.0)
3. No peer-to-peer farmer networking (out of scope)
4. Advisory engine doesn't support images (planned for v2.0)
5. No offline ML model updates (technical constraint)

**Future Enhancements**:
1. Satellite imagery integration for crop health monitoring
2. Blockchain for supply chain transparency
3. Integration with government subsidy systems
4. Predictive maintenance for farm equipment
5. Carbon credit tracking for sustainable practices


## 18. Technology Stack Summary

### 18.1 Backend Services

| Component | Technology | Justification |
|-----------|-----------|---------------|
| API Services | Python 3.11 + FastAPI | High performance, async support, ML integration |
| User Service | Node.js 20 + Express | Fast I/O, large ecosystem, JWT support |
| ML Framework | PyTorch, Scikit-learn, XGBoost | Industry standard, comprehensive libraries |
| LLM Service | AWS Bedrock (Claude 3) | Managed service, multilingual support |
| Time-series Forecasting | Prophet, LSTM | Proven for agricultural price prediction |
| NLP | Hugging Face Transformers | State-of-art multilingual models |

### 18.2 Data Storage

| Component | Technology | Justification |
|-----------|-----------|---------------|
| Time-series DB | AWS Timestream | Purpose-built for time-series, auto-scaling |
| Relational DB | Amazon Aurora PostgreSQL | High availability, performance, compatibility |
| NoSQL DB | Amazon DynamoDB | Serverless, global tables, low latency |
| Cache | Amazon ElastiCache (Redis) | In-memory performance, clustering support |
| Data Lake | Amazon S3 | Scalable, durable, cost-effective |
| Search | Amazon OpenSearch | Full-text search, vector search for RAG |

### 18.3 Infrastructure

| Component | Technology | Justification |
|-----------|-----------|---------------|
| Compute | AWS ECS Fargate | Serverless containers, auto-scaling |
| Serverless | AWS Lambda | Event-driven, cost-effective |
| API Gateway | AWS API Gateway | Managed, integrated with AWS services |
| CDN | Amazon CloudFront | Global edge network, DDoS protection |
| Load Balancer | Application Load Balancer | Layer 7 routing, health checks |
| Container Registry | Amazon ECR | Integrated with ECS, secure |

### 18.4 Mobile Application

| Component | Technology | Justification |
|-----------|-----------|---------------|
| Framework | React Native | Cross-platform, single codebase |
| State Management | Redux | Predictable state, dev tools |
| Navigation | React Navigation | Standard for React Native |
| Offline Storage | AsyncStorage + SQLite | Persistent storage, structured data |
| Push Notifications | Firebase Cloud Messaging | Cross-platform, reliable |
| Analytics | AWS Pinpoint | Integrated with AWS, privacy-focused |

### 18.5 DevOps and Monitoring

| Component | Technology | Justification |
|-----------|-----------|---------------|
| CI/CD | GitHub Actions | Integrated with GitHub, flexible |
| IaC | Terraform | Multi-cloud, declarative, state management |
| Monitoring | Amazon CloudWatch | Native AWS integration |
| Logging | CloudWatch Logs | Centralized, searchable |
| Tracing | AWS X-Ray | Distributed tracing, performance insights |
| Secrets | AWS Secrets Manager | Automatic rotation, encryption |
| Container Scanning | Trivy | Open-source, comprehensive |

### 18.6 Security

| Component | Technology | Justification |
|-----------|-----------|---------------|
| Authentication | AWS Cognito | Managed, scalable, MFA support |
| Authorization | JWT + RBAC | Stateless, flexible |
| WAF | AWS WAF | DDoS protection, rate limiting |
| Encryption | AWS KMS | Managed keys, audit trail |
| Secrets | AWS Secrets Manager | Rotation, encryption |
| Threat Detection | AWS GuardDuty | ML-based threat detection |


## 19. Implementation Phases

### 19.1 Phase 1: Foundation (Months 1-6)

**Objectives**: Core infrastructure and basic functionality

**Deliverables**:
- AWS infrastructure setup (VPC, networking, security)
- User authentication and profile management
- Price forecasting service (top 50 crop-mandi combinations)
- Basic mobile app (Android) with offline support
- Data ingestion pipeline for mandi prices
- 5 pilot states: Punjab, Haryana, Uttar Pradesh, Maharashtra, Karnataka

**Success Criteria**:
- 100,000 registered users
- 70% price forecast accuracy
- 99% uptime
- <3 second response times

### 19.2 Phase 2: Intelligence (Months 7-12)

**Objectives**: Add AI capabilities and expand coverage

**Deliverables**:
- Weather risk scoring service
- Demand prediction service
- Advisory engine with 5 languages (Hindi, English, Punjabi, Marathi, Kannada)
- iOS mobile app
- Web portal for administrators
- Notification service
- 15 states coverage

**Success Criteria**:
- 500,000 registered users
- 75% risk score correlation with crop losses
- 65% demand prediction accuracy
- 4.0+ user satisfaction rating

### 19.3 Phase 3: Scale (Months 13-18)

**Objectives**: Nationwide coverage and optimization

**Deliverables**:
- Full 10-language support
- API for third-party integrations
- Advanced analytics and reporting
- ML model optimization and retraining pipeline
- Multi-region deployment (DR setup)
- All 28 states and 8 UTs coverage

**Success Criteria**:
- 1,000,000+ registered users
- 99.5% uptime
- <$2 cost per user annually
- 50% monthly active user retention

### 19.4 Phase 4: Enhancement (Months 19-24)

**Objectives**: Advanced features and ecosystem integration

**Deliverables**:
- Image-based crop disease detection
- Voice-first interface improvements
- Integration with government schemes
- Farmer community features
- Advanced personalization
- Predictive analytics dashboard

**Success Criteria**:
- 5,000,000+ registered users
- 10% demonstrated increase in farmer income
- 15% reduction in crop losses
- NPS score >40

