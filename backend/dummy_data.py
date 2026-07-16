import sys
import os
import asyncio
import json
import random
from datetime import datetime, timedelta

# Ensure the backend directory is in the path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, delete
from app.db.database import AsyncSessionLocal, engine
from app.models.security import Role, Employee
from app.models.restaurant import RestaurantTable
from app.models.menu import MenuCategory, MenuItem
from app.models.ordering import CustomerSession, Order, OrderItem, OrderStatusHistory
from app.models.billing import Bill, BillItem, Payment
from app.core.security import get_password_hash

LOG_FILE = "dummy_data_log.json"

async def get_or_create_role(session: AsyncSession, name: str, desc: str):
    stmt = select(Role).where(Role.name == name)
    result = await session.execute(stmt)
    role = result.scalars().first()
    if not role:
        role = Role(name=name, description=desc)
        session.add(role)
        await session.commit()
        await session.refresh(role)
    return role

async def seed():
    print("Generating dummy data...")
    ids = {
        "Employee": [], "MenuCategory": [], "MenuItem": [], 
        "RestaurantTable": [], "CustomerSession": [], "Order": [], 
        "OrderItem": [], "OrderStatusHistory": [], "Bill": [], "BillItem": [], "Payment": []
    }
    
    async with AsyncSessionLocal() as session:
        # Roles
        operator_role = await get_or_create_role(session, "operator", "Operator Role")
        waiter_role = await get_or_create_role(session, "waiter", "Waiter Role")
        
        # Employees
        password_hash = get_password_hash("password123")
        employees = []
        for emp_data in [
            {"code": "DUMMY_OP1", "email": "dummy_operator@dineops.com", "phone": "1000000001", "fname": "Dummy", "lname": "Operator", "role_id": operator_role.id},
            {"code": "DUMMY_W1", "email": "dummy_waiter1@dineops.com", "phone": "1000000002", "fname": "John", "lname": "Waiter", "role_id": waiter_role.id},
            {"code": "DUMMY_W2", "email": "dummy_waiter2@dineops.com", "phone": "1000000003", "fname": "Jane", "lname": "Waiter", "role_id": waiter_role.id}
        ]:
            stmt = select(Employee).where(Employee.email == emp_data["email"])
            res = await session.execute(stmt)
            emp = res.scalars().first()
            if not emp:
                emp = Employee(employee_code=emp_data["code"], email=emp_data["email"], phone=emp_data["phone"], hashed_password=password_hash, first_name=emp_data["fname"], last_name=emp_data["lname"], role_id=emp_data["role_id"])
                session.add(emp)
                await session.commit()
                await session.refresh(emp)
            employees.append(emp)
        for e in employees: ids["Employee"].append(e.id)
        waiters = [employees[1], employees[2]]
        
        tables = []
        for i in range(1, 11):
            stmt = select(RestaurantTable).where(RestaurantTable.table_number == f"DUMMY_T{i}")
            res = await session.execute(stmt)
            t = res.scalars().first()
            if not t:
                t = RestaurantTable(table_number=f"DUMMY_T{i}", capacity=random.choice([2, 4, 6]), status="Available")
                session.add(t)
                await session.commit()
                await session.refresh(t)
            tables.append(t)
        for t in tables: ids["RestaurantTable"].append(t.id)

        cat_names = ["Starters", "Main Course", "Desserts", "Beverages"]
        categories = []
        for cn in cat_names:
            stmt = select(MenuCategory).where(MenuCategory.name == f"Dummy {cn}")
            res = await session.execute(stmt)
            c = res.scalars().first()
            if not c:
                c = MenuCategory(name=f"Dummy {cn}", description=f"Dummy {cn} items")
                session.add(c)
                await session.commit()
                await session.refresh(c)
            categories.append(c)
        for c in categories: ids["MenuCategory"].append(c.id)

        # Items
        items_data = [
            ("Starters", "Spring Rolls", 12.00), ("Starters", "Garlic Bread", 8.50), ("Starters", "Chicken Wings", 15.00),
            ("Main Course", "Margherita Pizza", 25.00), ("Main Course", "Pasta Alfredo", 22.00), ("Main Course", "Grilled Salmon", 35.00),
            ("Main Course", "Steak", 45.00), ("Main Course", "Veggie Burger", 18.00),
            ("Desserts", "Cheesecake", 10.00), ("Desserts", "Chocolate Brownie", 9.00), ("Desserts", "Ice Cream", 6.00),
            ("Beverages", "Cola", 4.00), ("Beverages", "Lemonade", 5.00), ("Beverages", "Coffee", 3.50)
        ]
        
        menu_items = []
        code_idx = 1
        for cat_name, item_name, price in items_data:
            cat = next(c for c in categories if c.name == f"Dummy {cat_name}")
            stmt = select(MenuItem).where(MenuItem.item_code == f"DUMMY_I{code_idx}")
            res = await session.execute(stmt)
            mi = res.scalars().first()
            if not mi:
                mi = MenuItem(
                    category_id=cat.id, item_code=f"DUMMY_I{code_idx}", name=f"Dummy {item_name}", 
                    description=f"Delicious dummy {item_name}", price=price
                )
                session.add(mi)
                await session.commit()
                await session.refresh(mi)
            menu_items.append(mi)
            code_idx += 1
        for mi in menu_items: ids["MenuItem"].append(mi.id)

        # Sessions, Orders, Bills
        now = datetime.utcnow()
        
        for i in range(25): # 25 sessions
            table = random.choice(tables)
            
            # Determine logic for this session to make it look "alive"
            # 60% Completed, 40% Active
            is_active = random.random() < 0.4
            session_status = "Active" if is_active else "Completed"
            
            # Spread times across the last 12 hours
            hours_ago = random.randint(0, 11)
            minutes_ago = random.randint(0, 59)
            created_time = now - timedelta(hours=hours_ago, minutes=minutes_ago)
            
            session_obj = CustomerSession(
                table_id=table.id,
                customer_name=f"Dummy Customer {i}",
                customer_phone=f"555000{i:04d}",
                number_of_people=random.randint(1, 4),
                status=session_status,
                created_at=created_time,
                updated_at=created_time
            )
            session.add(session_obj)
            await session.commit()
            ids["CustomerSession"].append(session_obj.id)
            
            if is_active:
                # Update table status if active
                stmt = select(RestaurantTable).where(RestaurantTable.id == table.id)
                res = await session.execute(stmt)
                tbl = res.scalars().first()
                if tbl:
                    tbl.status = random.choice(["Occupied", "Reserved"])
                    await session.commit()

            # Orders
            waiter = random.choice(waiters)
            num_orders = random.randint(1, 3)
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
                    created_at=created_time + timedelta(minutes=1),
                    updated_at=created_time + timedelta(minutes=1)
                )
                session.add(order)
                await session.commit()
                ids["Order"].append(order.id)

                history = OrderStatusHistory(order_id=order.id, status=order_status, changed_by_employee_id=waiter.id, changed_at=created_time + timedelta(minutes=1))
                session.add(history)
                await session.commit()
                ids["OrderStatusHistory"].append(history.id)

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
                        created_at=created_time + timedelta(minutes=1)
                    )
                    session.add(oi)
                    await session.commit()
                    ids["OrderItem"].append(oi.id)

            # Bill (Generate bills for all completed sessions, and some active sessions)
            if not is_active or random.random() < 0.3:
                bill_status = "Paid" if not is_active else "Pending"
                bill_time = created_time + timedelta(minutes=30)
                
                bill = Bill(
                    session_id=session_obj.id,
                    bill_number=f"DUMMY-BILL-{i}",
                    generated_by_employee_id=employees[0].id, # Operator
                    subtotal=session_total,
                    total_tax=session_total * 0.1, # 10% tax
                    total_discount=0,
                    service_charge=0,
                    grand_total=session_total * 1.1,
                    payment_status=bill_status,
                    created_at=bill_time
                )
                session.add(bill)
                await session.commit()
                ids["Bill"].append(bill.id)

                # Bill Items (Simplified)
                b_item = BillItem(
                    bill_id=bill.id,
                    item_name="Dummy Consolidated Order",
                    quantity=1,
                    price=session_total,
                    total=session_total
                )
                session.add(b_item)
                await session.commit()
                ids["BillItem"].append(b_item.id)

                # Payment (Only if Paid)
                if bill_status == "Paid":
                    payment = Payment(
                        bill_id=bill.id,
                        amount=bill.grand_total,
                        payment_method=random.choice(["Cash", "Card", "UPI"]),
                        transaction_id=f"DUMMY-TXN-{i}",
                        status="Success",
                        created_at=bill_time + timedelta(minutes=5)
                    )
                    session.add(payment)
                    await session.commit()
                    ids["Payment"].append(payment.id)
            
    with open(LOG_FILE, "w") as f:
        json.dump(ids, f)

    print("Dummy data successfully generated!")

async def clear():
    if not os.path.exists(LOG_FILE):
        print("No dummy data log found. Nothing to clear.")
        return

    with open(LOG_FILE, "r") as f:
        ids = json.load(f)

    print("Clearing dummy data...")
    async with AsyncSessionLocal() as session:
        # Delete in reverse order to respect foreign keys
        entities = [
            (Payment, "Payment"), (BillItem, "BillItem"), (Bill, "Bill"),
            (OrderItem, "OrderItem"), (OrderStatusHistory, "OrderStatusHistory"), (Order, "Order"),
            (CustomerSession, "CustomerSession"), (RestaurantTable, "RestaurantTable"),
            (MenuItem, "MenuItem"), (MenuCategory, "MenuCategory"), (Employee, "Employee")
        ]

        for model, key in entities:
            if ids.get(key):
                stmt = delete(model).where(model.id.in_(ids[key]))
                await session.execute(stmt)
                await session.commit()
                print(f"Cleared {len(ids[key])} records from {key}.")

    os.remove(LOG_FILE)
    print("Dummy data successfully cleared!")

async def main(cmd: str):
    try:
        if cmd == "--seed":
            await seed()
        elif cmd == "--clear":
            await clear()
        else:
            print("Invalid command. Use --seed or --clear")
    finally:
        await engine.dispose()


if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Usage: python dummy_data.py [--seed|--clear]")
        sys.exit(1)

    asyncio.run(main(sys.argv[1]))
