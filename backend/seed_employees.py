import asyncio
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from app.db.database import AsyncSessionLocal, engine
from app.models.security import Employee, Role
from app.core.security import get_password_hash

async def seed_employees():
    async with AsyncSessionLocal() as db:
        # Get roles
        admin_role = (await db.execute(select(Role).filter(Role.name == "Admin"))).scalar_one_or_none()
        operator_role = (await db.execute(select(Role).filter(Role.name == "Operator"))).scalar_one_or_none()
        waiter_role = (await db.execute(select(Role).filter(Role.name == "Waiter"))).scalar_one_or_none()

        if not operator_role or not waiter_role:
            print("Roles not found. Run seed.py first.")
            return

        # Check operator
        operator = (await db.execute(select(Employee).filter(Employee.email == "operator@dineops.com"))).scalar_one_or_none()
        if not operator:
            operator = Employee(
                employee_code="EMP001",
                email="operator@dineops.com",
                phone="1234567890",
                hashed_password=get_password_hash("operator123"),
                first_name="Test",
                last_name="Operator",
                role_id=operator_role.id,
                is_active=True
            )
            db.add(operator)
            print("Created operator@dineops.com / operator123")

        # Check waiter
        waiter = (await db.execute(select(Employee).filter(Employee.email == "waiter@dineops.com"))).scalar_one_or_none()
        if not waiter:
            waiter = Employee(
                employee_code="EMP002",
                email="waiter@dineops.com",
                phone="0987654321",
                hashed_password=get_password_hash("waiter123"),
                first_name="Test",
                last_name="Waiter",
                role_id=waiter_role.id,
                is_active=True
            )
            db.add(waiter)
            print("Created waiter@dineops.com / waiter123")

        await db.commit()
        print("Done.")
    await engine.dispose()

if __name__ == "__main__":
    asyncio.run(seed_employees())
