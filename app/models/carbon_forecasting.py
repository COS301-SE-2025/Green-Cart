from sqlalchemy import Column, Integer, String, Float, DateTime, JSON, ForeignKey, Boolean, Text, Enum
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from app.db.database import Base

class CarbonForecast(Base):
    """Sustainability scoring and forecasting model"""
    __tablename__ = "carbon_forecasts"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(String(36), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    forecast_type = Column(Enum("daily", "weekly", "monthly", "quarterly", "yearly", name="forecast_type"), nullable=False)
    
    # Prediction data (0-100 scoring system)
    predicted_sustainability_score = Column(Float, nullable=False)  # 0-100 sustainability score
    improvement_potential = Column(Float, nullable=False)  # 0-100 potential improvement
    confidence_score = Column(Float, nullable=False)  # 0-1 confidence
    
    # Temporal data
    target_date = Column(DateTime, nullable=False)
    forecast_horizon_days = Column(Integer, nullable=False)  # How far into future
    
    # Advanced analytics
    trend_direction = Column(Enum("improving", "declining", "stable", "volatile", name="trend_direction"))
    seasonal_factor = Column(Float, default=1.0)  # Seasonal adjustment multiplier
    behavioral_score = Column(Float)  # User behavior consistency score
    
    # Prediction breakdown
    prediction_factors = Column(JSON)  # Detailed factors contributing to prediction
    algorithm_metadata = Column(JSON)  # Algorithm parameters and confidence intervals
    
    created_at = Column(DateTime, server_default=func.now())
    updated_at = Column(DateTime, server_default=func.now(), onupdate=func.now())

    # Relationships
    user = relationship("User")

class CarbonForecastAccuracy(Base):
    """Track accuracy of our sustainability score predictions for continuous learning"""
    __tablename__ = "carbon_forecast_accuracy"

    id = Column(Integer, primary_key=True, index=True)
    forecast_id = Column(Integer, ForeignKey("carbon_forecasts.id", ondelete="CASCADE"), nullable=False)
    actual_sustainability_score = Column(Float)  # Actual measured sustainability score (0-100)
    accuracy_percentage = Column(Float)  # How accurate was our prediction
    error_magnitude = Column(Float)  # Absolute error
    error_direction = Column(Enum("over_predicted", "under_predicted", "exact", name="error_direction"))
    
    measured_at = Column(DateTime, server_default=func.now())
    
    # Relationships
    forecast = relationship("CarbonForecast")

class UserShoppingPattern(Base):
    """Advanced user shopping behavior analysis"""
    __tablename__ = "user_shopping_patterns"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(String(36), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    
    # Shopping frequency patterns
    avg_orders_per_week = Column(Float)
    avg_order_value = Column(Float)
    avg_sustainability_score_per_order = Column(Float)  # Average sustainability score (0-100) per order
    
    # Behavioral metrics
    eco_consciousness_score = Column(Float)  # 0-100 how much they care about sustainability
    price_sensitivity = Column(Float)  # 0-1 how much price affects decisions
    brand_loyalty_score = Column(Float)  # 0-1 brand consistency
    
    # Shopping preferences
    preferred_categories = Column(JSON)  # List of category preferences with scores
    sustainable_product_ratio = Column(Float)  # % of sustainable products they buy
    peak_shopping_hours = Column(JSON)  # Time-based shopping patterns
    seasonal_spending_pattern = Column(JSON)  # Monthly spending variations
    
    # Trend analysis
    sustainability_trend_30d = Column(Float)  # % change in sustainability score last 30 days
    sustainability_trend_90d = Column(Float)  # % change in sustainability score last 90 days
    sustainability_trend_365d = Column(Float)  # % change in sustainability score last year
    
    # Goal achievement
    goals_achievement_rate = Column(Float)  # % of sustainability goals achieved
    improvement_velocity = Column(Float)  # Rate of improvement in sustainability scores
    
    last_calculated = Column(DateTime, server_default=func.now())
    
    # Relationships
    user = relationship("User")

class CarbonImpactMetrics(Base):
    """Advanced sustainability impact tracking and analytics"""
    __tablename__ = "carbon_impact_metrics"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(String(36), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    
    # Sustainability metrics (0-100 scoring)
    total_lifetime_sustainability_score = Column(Float, default=50.0)  # Average lifetime sustainability score
    total_lifetime_improvement = Column(Float, default=0.0)  # Total improvement in sustainability score
    sustainability_efficiency_score = Column(Float)  # Sustainability score per order
    
    # Comparative analytics
    percentile_rank = Column(Float)  # Where user ranks vs others (0-100)
    sustainability_score_vs_average = Column(Float)  # Sustainability score vs average user
    
    # Achievement tracking
    milestones_reached = Column(JSON)  # List of sustainability improvement milestones
    streak_days = Column(Integer, default=0)  # Days of consecutive improvement
    best_month_improvement = Column(Float)  # Highest monthly sustainability improvement achieved
    
    # Predictive insights
    predicted_annual_improvement = Column(Float)  # Forecasted yearly improvement
    sustainability_target_eta = Column(DateTime)  # Estimated date to reach sustainability target
    
    last_updated = Column(DateTime, server_default=func.now(), onupdate=func.now())
    
    # Relationships
    user = relationship("User")

class ForecastingModelConfig(Base):
    """Configuration for different forecasting algorithms"""
    __tablename__ = "forecasting_model_configs"

    id = Column(Integer, primary_key=True, index=True)
    model_name = Column(String(100), unique=True, nullable=False)
    model_version = Column(String(20), nullable=False)
    
    # Model parameters
    parameters = Column(JSON)  # Algorithm-specific parameters
    weights = Column(JSON)  # Feature weights
    
    # Performance metrics
    accuracy_score = Column(Float)  # Overall model accuracy
    mse_score = Column(Float)  # Mean squared error
    mae_score = Column(Float)  # Mean absolute error
    
    # Model metadata
    training_data_size = Column(Integer)  # Number of training samples
    last_trained = Column(DateTime)
    is_active = Column(Boolean, default=True)
    
    created_at = Column(DateTime, server_default=func.now())
    updated_at = Column(DateTime, server_default=func.now(), onupdate=func.now())