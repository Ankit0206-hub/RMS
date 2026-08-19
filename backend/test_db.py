import asyncio
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy.orm import sessionmaker
from sqlalchemy import select
from app.models.billing import Bill

# Use the mysql URL from env
DATABASE_URL = "mysql+aiomysql://root:root@127.0.0.1:3306/dineops"
engine = create_async_engine(DATABASE_URL)
async_session = sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)

async def test():
    async with async_session() as db:
        stmt = select(Bill)
        res = await db.execute(stmt)
        bills = res.scalars().all()
        for b in bills:
            print(f"Bill ID {b.id}, Session ID {b.session_id}, Status {b.payment_status}")
            
asyncio.run(test())
