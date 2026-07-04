import asyncio
from sqlalchemy.ext.asyncio import AsyncSession
from app.db.database import AsyncSessionLocal
from app.repositories.admin.admin_repository import admin_repo
from app.models.security import Role

async def seed_admin():
    async with AsyncSessionLocal() as db:
        admin = await admin_repo.get_by_email(db, "admin@dineops.com")
        if not admin:
            print("Creating initial admin...")
            await admin_repo.create_initial_admin(db, "admin@dineops.com", "admin123")
            
            # Create standard roles
            operator_role = Role(name="Operator", description="Restaurant Operator")
            waiter_role = Role(name="Waiter", description="Restaurant Waiter")
            db.add_all([operator_role, waiter_role])
            await db.commit()
            print("Admin and roles created.")
        else:
            print("Admin already exists.")

if __name__ == "__main__":
    asyncio.run(seed_admin())
