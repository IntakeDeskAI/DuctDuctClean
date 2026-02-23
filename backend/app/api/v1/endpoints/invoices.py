from fastapi import APIRouter

router = APIRouter()


@router.get("/")
async def list_invoices():
    return []


@router.post("/")
async def create_invoice():
    return {}


@router.get("/{invoice_id}")
async def get_invoice(invoice_id: str):
    return {}


@router.post("/{invoice_id}/pay")
async def pay_invoice(invoice_id: str):
    return {}
