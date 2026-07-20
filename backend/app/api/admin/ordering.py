from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession
from app.api.deps import get_current_staff
from app.db.database import get_db
from app.schemas.common import StandardResponse, PaginationMeta
from app.schemas.ordering import CustomerSessionResponse, CustomerSessionCreate, OrderResponse, OrderCreate, OrderStatusUpdate
from app.services.ordering_service import OrderingService

router = APIRouter(prefix="/ordering", tags=["Admin - Ordering"], dependencies=[Depends(get_current_staff)])
service = OrderingService()

@router.post("/sessions", response_model=StandardResponse[CustomerSessionResponse])
async def create_session(session_in: CustomerSessionCreate, db: AsyncSession = Depends(get_db)):
    session = await service.create_session(db, session_in)
    return StandardResponse(success=True, message="Session created successfully", data=session)

@router.get("/sessions", response_model=StandardResponse[list[CustomerSessionResponse]])
async def get_sessions(
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1),
    status: str = None,
    db: AsyncSession = Depends(get_db)
):
    sessions, total = await service.get_sessions(db, page, page_size, status)
    meta = PaginationMeta(total=total, page=page, page_size=page_size)
    return StandardResponse(success=True, message="Sessions retrieved successfully", data=sessions, meta=meta)

@router.get("/sessions/{session_id}", response_model=StandardResponse[CustomerSessionResponse])
async def get_session(session_id: int, db: AsyncSession = Depends(get_db)):
    session = await service.get_session(db, session_id)
    return StandardResponse(success=True, message="Session retrieved successfully", data=session)

@router.post("/orders", response_model=StandardResponse[OrderResponse])
async def create_order(order_in: OrderCreate, db: AsyncSession = Depends(get_db)):
    # Note: For Admin, waiter_id is optionally handled if provided in future auth context.
    order = await service.create_order(db, order_in)
    return StandardResponse(success=True, message="Order created successfully", data=order)

@router.get("/orders", response_model=StandardResponse[list[OrderResponse]])
async def get_orders(
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1),
    status: str = None,
    db: AsyncSession = Depends(get_db)
):
    orders, total = await service.get_orders(db, page, page_size, status)
    meta = PaginationMeta(total=total, page=page, page_size=page_size)
    return StandardResponse(success=True, message="Orders retrieved successfully", data=orders, meta=meta)

@router.get("/orders/{order_id}", response_model=StandardResponse[OrderResponse])
async def get_order(order_id: int, db: AsyncSession = Depends(get_db)):
    order = await service.get_order(db, order_id)
    return StandardResponse(success=True, message="Order retrieved successfully", data=order)

@router.patch("/orders/{order_id}/status", response_model=StandardResponse[OrderResponse])
async def update_order_status(order_id: int, status_update: OrderStatusUpdate, db: AsyncSession = Depends(get_db)):
    order = await service.update_order_status(db, order_id, status_update)
    return StandardResponse(success=True, message="Order status updated successfully", data=order)
