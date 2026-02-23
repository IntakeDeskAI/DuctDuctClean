from sqlalchemy import Column, String, Date, Time, ForeignKey, Text
from sqlalchemy.dialects.postgresql import UUID
from app.models.base import Base, UUIDMixin, TimestampMixin


class Booking(Base, UUIDMixin, TimestampMixin):
    __tablename__ = "bookings"

    customer_id = Column(UUID(as_uuid=True), ForeignKey("customers.id"), nullable=False)
    service_id = Column(UUID(as_uuid=True), ForeignKey("services.id"), nullable=False)
    scheduled_date = Column(Date, nullable=False)
    scheduled_time = Column(Time, nullable=False)
    status = Column(String, default="pending", nullable=False)
    notes = Column(Text)
