from fastapi import APIRouter

router = APIRouter()


@router.get("/")
async def list_quotes():
    return []


@router.post("/")
async def create_quote():
    return {}


@router.get("/{quote_id}")
async def get_quote(quote_id: str):
    return {}


@router.post("/{quote_id}/send")
async def send_quote(quote_id: str):
    return {}
