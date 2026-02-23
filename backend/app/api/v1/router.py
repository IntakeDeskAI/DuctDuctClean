from fastapi import APIRouter
from app.api.v1.endpoints import bookings, customers, quotes, invoices, services, notifications

api_router = APIRouter()

api_router.include_router(bookings.router, prefix="/bookings", tags=["bookings"])
api_router.include_router(customers.router, prefix="/customers", tags=["customers"])
api_router.include_router(quotes.router, prefix="/quotes", tags=["quotes"])
api_router.include_router(invoices.router, prefix="/invoices", tags=["invoices"])
api_router.include_router(services.router, prefix="/services", tags=["services"])
api_router.include_router(notifications.router, prefix="/notifications", tags=["notifications"])
