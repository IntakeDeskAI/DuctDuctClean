from fastapi import APIRouter

router = APIRouter()


@router.get("/")
async def list_customers():
    return []


@router.post("/")
async def create_customer():
    return {}


@router.get("/{customer_id}")
async def get_customer(customer_id: str):
    return {}


@router.patch("/{customer_id}")
async def update_customer(customer_id: str):
    return {}
