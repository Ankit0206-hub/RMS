import asyncio
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy.orm import sessionmaker
from sqlalchemy import select
from app.models.billing import Bill
from app.models.ordering import Order, CustomerSession

DATABASE_URL = "sqlite+aiosqlite:///./rms.db"
engine = create_async_engine(DATABASE_URL)
async_session = sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)

async def test():
    async with async_session() as db:
        # Find a session with a pending bill
        stmt = select(Bill).where(Bill.payment_status != 'Paid')
        res = await db.execute(stmt)
        bills = res.scalars().all()
        print(f"Found {len(bills)} unpaid bills.")
        if not bills:
            return
            
        b = bills[0]
        print(f"Bill ID {b.id}, Session ID {b.session_id}")
        
        # Try to delete it just like in create_order
        stmt2 = select(Bill).where(Bill.session_id == b.session_id, Bill.payment_status != 'Paid')
        res2 = await db.execute(stmt2)
        existing_bills = res2.scalars().all()
        print(f"To delete: {[b.id for b in existing_bills]}")
        for bill in existing_bills:
            await db.delete(bill)
        
        if existing_bills:
            await db.commit()
            print("Deleted successfully!")
            
        # Verify it's gone
        stmt3 = select(Bill).where(Bill.id == b.id)
        res3 = await db.execute(stmt3)
        b3 = res3.scalars().first()
        print("After delete, bill exists?", b3 is not None)

asyncio.run(test())
