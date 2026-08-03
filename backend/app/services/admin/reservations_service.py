from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, update
from sqlalchemy.orm import selectinload
from fastapi import HTTPException
from typing import List

from app.models.restaurant import TableReservation, RestaurantTable
from app.schemas.admin.reservations import ReservationCreate, ReservationUpdate

from datetime import datetime, timedelta

async def get_all_reservations(db: AsyncSession, skip: int = 0, limit: int = 100, date_str: str = None):
    query = select(TableReservation).options(selectinload(TableReservation.table)).order_by(TableReservation.reservation_time.asc())
    
    if date_str:
        try:
            start_of_day = datetime.strptime(date_str, "%Y-%m-%d")
            end_of_day = start_of_day + timedelta(days=1)
            query = query.where(TableReservation.reservation_time >= start_of_day, TableReservation.reservation_time < end_of_day)
        except ValueError:
            pass # ignore invalid dates
            
    query = query.offset(skip).limit(limit)
    result = await db.execute(query)
    reservations = result.scalars().all()
    
    # Map table_number to the response
    for r in reservations:
        r.table_number = r.table.table_number if r.table else None
        
    return reservations

async def get_reservation_by_id(db: AsyncSession, reservation_id: int):
    query = select(TableReservation).options(selectinload(TableReservation.table)).where(TableReservation.id == reservation_id)
    result = await db.execute(query)
    reservation = result.scalar_one_or_none()
    
    if not reservation:
        raise HTTPException(status_code=404, detail="Reservation not found")
        
    reservation.table_number = reservation.table.table_number if reservation.table else None
    return reservation

async def create_reservation(db: AsyncSession, obj_in: ReservationCreate):
    db_obj = TableReservation(
        customer_name=obj_in.customer_name,
        contact_number=obj_in.contact_number,
        reservation_time=obj_in.reservation_time,
        party_size=obj_in.party_size,
        status=obj_in.status,
        table_id=obj_in.table_id
    )
    db.add(db_obj)
    await db.commit()
    await db.refresh(db_obj)
    return await get_reservation_by_id(db, db_obj.id)

async def update_reservation(db: AsyncSession, reservation_id: int, obj_in: ReservationUpdate):
    reservation = await get_reservation_by_id(db, reservation_id)
    
    update_data = obj_in.model_dump(exclude_unset=True)
    
    if not update_data:
        return reservation
        
    # If confirming, try to set table to reserved if assigned
    if update_data.get('status') == 'Confirmed' and (reservation.table_id or update_data.get('table_id')):
        table_id = update_data.get('table_id') or reservation.table_id
        await db.execute(
            update(RestaurantTable).where(RestaurantTable.id == table_id).values(status="Reserved")
        )
    
    for field, value in update_data.items():
        setattr(reservation, field, value)
        
    await db.commit()
    await db.refresh(reservation)
    return await get_reservation_by_id(db, reservation.id)

async def delete_reservation(db: AsyncSession, reservation_id: int):
    reservation = await get_reservation_by_id(db, reservation_id)
    await db.delete(reservation)
    await db.commit()
    return {"message": "Reservation deleted successfully"}
