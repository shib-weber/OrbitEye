from sqlalchemy import Column, Integer, String, Float, DateTime, Text
from datetime import datetime, timezone
from database import Base

class RiskAlert(Base):
    __tablename__ = "risk_alerts"

    id = Column(Integer, primary_key=True, index=True)
    village_name = Column(String(100), index=True, nullable=False)
    ward_no = Column(String(50), nullable=False)
    latitude = Column(Float, nullable=False)
    longitude = Column(Float, nullable=False)
    change_type = Column(String(255), default="Surface Anomaly")
    detected_issues = Column(Text, default="[]") # JSON containing all exact GeoJSON clusters & explanations
    area_sq_meters = Column(Float, default=0.0)
    confidence_score = Column(Float, default=0.0)
    cloud_cover_percent = Column(Float, default=0.0)
    status = Column(String(50), default="PENDING_VERIFICATION")
    crack_density = Column(Float, nullable=True)
    crack_severity = Column(String(50), nullable=True)
    ai_inspector_notes = Column(Text, nullable=True)
    ai_mitigation_plan = Column(Text, nullable=True)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))