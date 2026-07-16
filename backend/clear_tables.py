import asyncio
from app.db.database import AsyncSessionLocal, engine
from app.models.ordering import CustomerSession
from app.models.restaurant import RestaurantTable
from sqlalchemy import select

async def run():
    async with AsyncSessionLocal() as db:
        sessions = (await db.execute(select(CustomerSession).where(CustomerSession.status=='Active'))).scalars().all()
        for s in sessions:
            s.status = 'Completed'
        tables = (await db.execute(select(RestaurantTable))).scalars().all()
        for t in tables:
            t.status = 'Available'
        await db.commit()
    print("All tables cleared successfully!")

asyncio.run(run())
