from fastapi import APIRouter

router = APIRouter()


@router.get("/")
async def list_services():
    return []


@router.post("/")
async def create_service():
    return {}


@router.patch("/{service_id}")
async def update_service(service_id: str):
    return {}
