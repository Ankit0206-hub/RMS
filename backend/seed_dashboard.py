import sys
import os
import asyncio
import random
from datetime import datetime, timedelta

# Ensure the backend directory is in the path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from sqlalchemy.orm import selectinload
from app.db.database import AsyncSessionLocal, engine
from app.models.security import Role, Employee
from app.models.restaurant import RestaurantTable
from app.models.menu import MenuCategory, MenuItem
from app.models.ordering import CustomerSession, Order, OrderItem, OrderStatusHistory
from app.models.billing import Bill, BillItem, Payment

async def seed_dashboard():
    print("Generating live dashboard data...")
    
    async with AsyncSessionLocal() as session:
        # Fetch existing employees (Waiters)
        stmt = select(Employee).options(selectinload(Employee.role))
        res = await session.execute(stmt)
        employees = res.scalars().all()
        waiters = [e for e in employees if e.role.name == 'waiter'] if employees else []
        operator = next((e for e in employees if e.role.name == 'operator'), employees[0] if employees else None)
        
        # Fetch existing tables
        stmt = select(RestaurantTable)
        res = await session.execute(stmt)
        tables = res.scalars().all()
        
        # Fetch existing menu items
        stmt = select(MenuItem)
        res = await session.execute(stmt)
        menu_items = res.scalars().all()

        if not tables or not menu_items or not waiters or not operator:
            print("Missing required base data (Tables, Menu Items, Waiters, Operator). Please run dummy_data.py first.")
            return

        now_utc = datetime.utcnow()
        # IST is UTC+5:30
        now_ist = now_utc + timedelta(hours=5, minutes=30)
        
        # Start at 8:00 AM IST today
        start_ist = datetime(now_ist.year, now_ist.month, now_ist.day, 8, 0, 0)
        start_utc = start_ist - timedelta(hours=5, minutes=30)
        
        # If it's before 8 AM IST, we just generate from midnight to now as fallback
        if now_utc < start_utc:
            start_utc = datetime(now_utc.year, now_utc.month, now_utc.day, 0, 0, 0)

        total_seconds = int((now_utc - start_utc).total_seconds())
        
        for i in range(25): # 25 live sessions
            table = random.choice(tables)
            
            # Determine logic for this session to make it look "alive"
            is_active = random.random() < 0.5
            session_status = "Active" if is_active else "Completed"
            
            # Pick a random second between start_utc and now_utc
            random_second = random.randint(0, total_seconds)
            created_time = start_utc + timedelta(seconds=random_second)
            
            session_obj = CustomerSession(
                table_id=table.id,
                customer_name=f"Live Customer {random.randint(100, 999)}",
                customer_phone=f"555{random.randint(1000000, 9999999)}",
                number_of_people=random.randint(1, 4),
                status=session_status,
                created_at=created_time,
                updated_at=created_time
            )
            session.add(session_obj)
            await session.commit()
            
            if is_active:
                table.status = random.choice(["Occupied", "Reserved"])
                await session.commit()

            # Orders
            waiter = random.choice(waiters)
            num_orders = random.randint(1, 4)
            session_total = 0.0
            
            for o_idx in range(num_orders):
                if is_active:
                    order_status = random.choice(["Pending", "Confirmed", "Cooked", "Served"])
                else:
                    order_status = "Completed"
                    
                order = Order(
                    session_id=session_obj.id,
                    waiter_id=waiter.id,
                    order_type="Dine-in",
                    status=order_status,
                    created_at=created_time + timedelta(minutes=1 + (o_idx*5)),
                    updated_at=created_time + timedelta(minutes=1 + (o_idx*5))
                )
                session.add(order)
                await session.commit()

                history = OrderStatusHistory(order_id=order.id, status=order_status, changed_by_employee_id=waiter.id, changed_at=created_time + timedelta(minutes=1 + (o_idx*5)))
                session.add(history)
                await session.commit()

                # Order Items
                num_items = random.randint(1, 4)
                for _ in range(num_items):
                    mi = random.choice(menu_items)
                    qty = random.randint(1, 3)
                    price_at_order = float(mi.price)
                    session_total += (price_at_order * qty)
                    
                    oi = OrderItem(
                        order_id=order.id,
                        menu_item_id=mi.id,
                        quantity=qty,
                        price_at_order=price_at_order,
                        created_at=created_time + timedelta(minutes=1 + (o_idx*5))
                    )
                    session.add(oi)
                    await session.commit()

            # Bill
            if not is_active or random.random() < 0.3:
                bill_status = "Paid" if not is_active else "Pending"
                bill_time = created_time + timedelta(minutes=30)
                
                bill = Bill(
                    session_id=session_obj.id,
                    bill_number=f"LIVE-BILL-{random.randint(1000, 9999)}",
                    generated_by_employee_id=operator.id,
                    subtotal=session_total,
                    total_tax=session_total * 0.1,
                    total_discount=0,
                    service_charge=0,
                    grand_total=session_total * 1.1,
                    payment_status=bill_status,
                    created_at=bill_time,
                    generated_at=bill_time
                )
                session.add(bill)
                await session.commit()

                b_item = BillItem(
                    bill_id=bill.id,
                    item_name="Consolidated Live Order",
                    quantity=1,
                    price=session_total,
                    total=session_total
                )
                session.add(b_item)
                await session.commit()

                if bill_status == "Paid":
                    payment = Payment(
                        bill_id=bill.id,
                        amount=bill.grand_total,
                        payment_method=random.choice(["Cash", "Card", "UPI"]),
                        transaction_id=f"LIVE-TXN-{random.randint(1000, 9999)}",
                        status="Success",
                        created_at=bill_time + timedelta(minutes=5)
                    )
                    session.add(payment)
                    await session.commit()

            # If completed, free the table
            if not is_active:
                table.status = "Available"
                await session.commit()

    print("Live dashboard data successfully generated!")

async def main():
    try:
        await seed_dashboard()
    finally:
        await engine.dispose()

if __name__ == "__main__":
    asyncio.run(main())
