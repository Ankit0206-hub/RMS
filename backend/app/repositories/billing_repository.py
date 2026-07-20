from typing import List, Optional, Tuple
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from sqlalchemy.orm import selectinload
from app.models.billing import Bill, BillItem, Payment
from app.models.ordering import CustomerSession, Order

class BillingRepository:
    async def create_bill(self, db: AsyncSession, bill_data: dict, items_data: List[dict]) -> Bill:
        db_bill = Bill(**bill_data)
        db.add(db_bill)
        await db.flush()
        
        for item in items_data:
            db_item = BillItem(bill_id=db_bill.id, **item)
            db.add(db_item)
            
        await db.commit()
        await db.refresh(db_bill)
        
        stmt = select(Bill).options(selectinload(Bill.items), selectinload(Bill.payments), selectinload(Bill.session).selectinload(CustomerSession.table)).where(Bill.id == db_bill.id)
        result = await db.execute(stmt)
        return result.scalars().first()

    async def get_bills(self, db: AsyncSession, page: int, page_size: int, payment_status: Optional[str] = None) -> Tuple[List[Bill], int]:
        stmt = select(Bill).options(selectinload(Bill.items), selectinload(Bill.payments), selectinload(Bill.session).selectinload(CustomerSession.table))
        count_stmt = select(func.count(Bill.id))
        
        if payment_status:
            stmt = stmt.where(Bill.payment_status == payment_status)
            count_stmt = count_stmt.where(Bill.payment_status == payment_status)
            
        total = await db.scalar(count_stmt)
        
        stmt = stmt.order_by(Bill.created_at.desc()).offset((page - 1) * page_size).limit(page_size)
        result = await db.execute(stmt)
        return result.scalars().all(), total

    async def get_bill_by_id(self, db: AsyncSession, bill_id: int) -> Optional[Bill]:
        stmt = select(Bill).options(selectinload(Bill.items), selectinload(Bill.payments), selectinload(Bill.session).selectinload(CustomerSession.table)).where(Bill.id == bill_id)
        result = await db.execute(stmt)
        return result.scalars().first()

    async def get_bill_by_session(self, db: AsyncSession, session_id: int) -> Optional[Bill]:
        stmt = select(Bill).options(selectinload(Bill.items), selectinload(Bill.payments), selectinload(Bill.session).selectinload(CustomerSession.table)).where(Bill.session_id == session_id)
        result = await db.execute(stmt)
        return result.scalars().first()
        
    async def add_payment(self, db: AsyncSession, bill_id: int, payment_data: dict) -> Payment:
        db_payment = Payment(bill_id=bill_id, **payment_data)
        db.add(db_payment)
        await db.commit()
        await db.refresh(db_payment)
        return db_payment
        
    async def update_bill_status(self, db: AsyncSession, bill_id: int, payment_status: str) -> Optional[Bill]:
        stmt = select(Bill).options(selectinload(Bill.items), selectinload(Bill.payments), selectinload(Bill.session).selectinload(CustomerSession.table)).where(Bill.id == bill_id)
        result = await db.execute(stmt)
        bill = result.scalars().first()
        if bill:
            bill.payment_status = payment_status
            await db.commit()
            await db.refresh(bill)
        return bill
