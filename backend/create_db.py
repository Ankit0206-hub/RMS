import asyncio
import aiomysql
from app.core.config import settings

async def create_database():
    conn = await aiomysql.connect(
        host=settings.MYSQL_HOST,
        port=int(settings.MYSQL_PORT),
        user=settings.MYSQL_USER,
        password=settings.MYSQL_PASSWORD,
    )
    async with conn.cursor() as cur:
        await cur.execute(f"DROP DATABASE IF EXISTS {settings.MYSQL_DB}")
        await cur.execute(f"CREATE DATABASE {settings.MYSQL_DB}")
    conn.close()

if __name__ == "__main__":
    asyncio.run(create_database())
