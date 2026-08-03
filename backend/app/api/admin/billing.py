from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession
from app.db.database import get_db
from app.api.deps import get_current_admin_or_operator, get_strict_operator
from app.schemas.common import StandardResponse, PaginationMeta
from app.schemas.billing import BillResponse, BillCreate, PaymentResponse, PaymentCreate
from app.services.billing_service import BillingService

router = APIRouter(prefix="/billing", tags=["Admin - Billing"], dependencies=[Depends(get_current_admin_or_operator)])
service = BillingService()

@router.post("/bills", response_model=StandardResponse[BillResponse], dependencies=[Depends(get_strict_operator)])
async def create_bill(bill_in: BillCreate, db: AsyncSession = Depends(get_db)):
    bill = await service.generate_bill(db, session_id=bill_in.session_id, employee_id=None, discount_percentage=bill_in.discount_percentage)
    return StandardResponse(success=True, message="Bill generated successfully", data=bill)

@router.get("/bills", response_model=StandardResponse[list[BillResponse]])
async def get_bills(
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=10000),
    payment_status: str = None,
    db: AsyncSession = Depends(get_db),
    current_user = Depends(get_current_admin_or_operator)
):
    bills, total = await service.get_bills(db, page, page_size, payment_status)
    meta = PaginationMeta(total=total, page=page, page_size=page_size)
    return StandardResponse(success=True, message="Bills retrieved successfully", data=bills, meta=meta)

@router.get("/requests")
async def get_bill_requests(db: AsyncSession = Depends(get_db), current_user = Depends(get_current_admin_or_operator)):
    from app.models.ordering import CustomerSession
    from app.models.restaurant import RestaurantTable
    from sqlalchemy import select
    from sqlalchemy.orm import selectinload
    
    query = select(CustomerSession).where(
        CustomerSession.bill_requested == True,
        CustomerSession.status == "Active"
    ).options(selectinload(CustomerSession.table))
    
    result = await db.execute(query)
    sessions = result.scalars().all()
    
    requests = []
    for s in sessions:
        requests.append({
            "session_id": s.id,
            "table_number": s.table.table_number if s.table else "N/A",
            "customer_name": s.customer_name,
            "requested_at": s.updated_at.isoformat() if s.updated_at else s.created_at.isoformat()
        })
        
    return StandardResponse(success=True, message="Bill requests retrieved", data=requests)

@router.get("/bills/{bill_id}", response_model=StandardResponse[BillResponse])
async def get_bill(bill_id: int, db: AsyncSession = Depends(get_db)):
    bill = await service.get_bill(db, bill_id)
    return StandardResponse(success=True, message="Bill retrieved successfully", data=bill)

@router.post("/bills/{bill_id}/payments", response_model=StandardResponse[PaymentResponse], dependencies=[Depends(get_strict_operator)])
async def add_payment(bill_id: int, payment_in: PaymentCreate, db: AsyncSession = Depends(get_db)):
    payment = await service.add_payment(db, bill_id, payment_in)
    return StandardResponse(success=True, message="Payment added successfully", data=payment)
