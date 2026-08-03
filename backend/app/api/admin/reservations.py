from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from typing import List

from app.api.deps import get_db, get_current_admin_or_operator
from app.schemas.admin.reservations import ReservationCreate, ReservationUpdate, ReservationResponse
from app.services.admin import reservations_service
from app.schemas.common import StandardResponse, PaginationMeta

router = APIRouter()

@router.get("", response_model=StandardResponse[List[ReservationResponse]])
async def get_reservations(
    date: str = None,
    page: int = 1,
    page_size: int = 100,
    db: AsyncSession = Depends(get_db),
    current_user = Depends(get_current_admin_or_operator)
):
    skip = (page - 1) * page_size
    reservations = await reservations_service.get_all_reservations(db, skip=skip, limit=page_size, date_str=date)
    
    meta = PaginationMeta(total=len(reservations), page=page, page_size=page_size)
    return StandardResponse(data=reservations, meta=meta)

@router.post("", response_model=StandardResponse[ReservationResponse])
async def create_reservation(
    obj_in: ReservationCreate,
    db: AsyncSession = Depends(get_db),
    current_user = Depends(get_current_admin_or_operator)
):
    reservation = await reservations_service.create_reservation(db, obj_in)
    return StandardResponse(data=reservation)

@router.put("/{reservation_id}", response_model=StandardResponse[ReservationResponse])
async def update_reservation(
    reservation_id: int,
    obj_in: ReservationUpdate,
    db: AsyncSession = Depends(get_db),
    current_user = Depends(get_current_admin_or_operator)
):
    reservation = await reservations_service.update_reservation(db, reservation_id, obj_in)
    return StandardResponse(data=reservation)

@router.delete("/{reservation_id}", response_model=StandardResponse[dict])
async def delete_reservation(
    reservation_id: int,
    db: AsyncSession = Depends(get_db),
    current_user = Depends(get_current_admin_or_operator)
):
    result = await reservations_service.delete_reservation(db, reservation_id)
    return StandardResponse(data=result)
