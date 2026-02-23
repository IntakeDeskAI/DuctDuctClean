from sqlalchemy import Column, String, Integer, Numeric, ForeignKey, DateTime, ARRAY
from sqlalchemy.dialects.postgresql import UUID
from app.models.base import Base, UUIDMixin, TimestampMixin


class Quote(Base, UUIDMixin, TimestampMixin):
    __tablename__ = "quotes"

    customer_id = Column(UUID(as_uuid=True), ForeignKey("customers.id"), nullable=True)
    email = Column(String, nullable=False)
    property_type = Column(String, nullable=False)
    square_footage = Column(Integer)
    num_vents = Column(Integer)
    services_requested = Column(ARRAY(String))
    estimated_total = Column(Numeric(10, 2))
    status = Column(String, default="draft")
    expires_at = Column(DateTime)
