from sqlalchemy import Column, String, Numeric, ForeignKey, Date, DateTime
from sqlalchemy.dialects.postgresql import UUID
from app.models.base import Base, UUIDMixin, TimestampMixin


class Invoice(Base, UUIDMixin, TimestampMixin):
    __tablename__ = "invoices"

    booking_id = Column(UUID(as_uuid=True), ForeignKey("bookings.id"), nullable=False)
    customer_id = Column(UUID(as_uuid=True), ForeignKey("customers.id"), nullable=False)
    amount = Column(Numeric(10, 2), nullable=False)
    tax = Column(Numeric(10, 2), default=0)
    total = Column(Numeric(10, 2), nullable=False)
    status = Column(String, default="draft")
    stripe_payment_intent_id = Column(String, nullable=True)
    due_date = Column(Date, nullable=False)
    paid_at = Column(DateTime, nullable=True)
