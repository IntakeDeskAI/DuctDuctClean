from fastapi import APIRouter

router = APIRouter()


@router.post("/email")
async def send_email():
    """Send an email notification."""
    return {}


@router.post("/sms")
async def send_sms():
    """Send an SMS notification."""
    return {}
