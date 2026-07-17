import asyncio
from app.db.database import AsyncSessionLocal, engine
from sqlalchemy import text

async def get_roles():
    async with AsyncSessionLocal() as db:
        result = await db.execute(text('SELECT id, name FROM roles;'))
        print("ROLES:", result.fetchall())

    await engine.dispose()

asyncio.run(get_roles())
