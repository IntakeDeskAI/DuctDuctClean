from fastapi import APIRouter

router = APIRouter()


@router.get("/")
async def list_bookings():
    """List all bookings."""
    return []


@router.post("/")
async def create_booking():
    """Create a new booking."""
    return {}


@router.get("/{booking_id}")
async def get_booking(booking_id: str):
    """Get a specific booking."""
    return {}


@router.patch("/{booking_id}")
async def update_booking(booking_id: str):
    """Update a booking."""
    return {}


@router.delete("/{booking_id}")
async def cancel_booking(booking_id: str):
    """Cancel a booking."""
    return {}
