from sqlalchemy import Column, String, Numeric, Integer, Boolean, Text
from app.models.base import Base, UUIDMixin, TimestampMixin


class Service(Base, UUIDMixin, TimestampMixin):
    __tablename__ = "services"

    name = Column(String, nullable=False)
    description = Column(Text)
    base_price = Column(Numeric(10, 2), nullable=False)
    duration_minutes = Column(Integer, nullable=False)
    is_active = Column(Boolean, default=True)
