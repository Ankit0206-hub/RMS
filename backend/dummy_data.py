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
        employees = [
            Employee(employee_code="DUMMY_OP1", email="dummy_operator@dineops.com", phone="1000000001", hashed_password=password_hash, first_name="Dummy", last_name="Operator", role_id=operator_role.id),
            Employee(employee_code="DUMMY_W1", email="dummy_waiter1@dineops.com", phone="1000000002", hashed_password=password_hash, first_name="John", last_name="Waiter", role_id=waiter_role.id),
            Employee(employee_code="DUMMY_W2", email="dummy_waiter2@dineops.com", phone="1000000003", hashed_password=password_hash, first_name="Jane", last_name="Waiter", role_id=waiter_role.id)
        ]
        session.add_all(employees)
        await session.commit()
        for e in employees: ids["Employee"].append(e.id)
        waiters = [employees[1], employees[2]]
        
        # Tables
        tables = [RestaurantTable(table_number=f"DUMMY_T{i}", capacity=random.choice([2, 4, 6]), status="Available") for i in range(1, 11)]
        session.add_all(tables)
        await session.commit()
        for t in tables: ids["RestaurantTable"].append(t.id)

        # Categories
        cat_names = ["Starters", "Main Course", "Desserts", "Beverages"]
        categories = []
        for cn in cat_names:
            c = MenuCategory(name=f"Dummy {cn}", description=f"Dummy {cn} items")
            session.add(c)
            categories.append(c)
        await session.commit()
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
            mi = MenuItem(
                category_id=cat.id, item_code=f"DUMMY_I{code_idx}", name=f"Dummy {item_name}", 
                description=f"Delicious dummy {item_name}", price=price
            )
            session.add(mi)
            menu_items.append(mi)
            code_idx += 1
        await session.commit()
        for mi in menu_items: ids["MenuItem"].append(mi.id)

        # Sessions, Orders, Bills
        for i in range(20): # 20 sessions
            table = random.choice(tables)
            session_obj = CustomerSession(
                table_id=table.id,
                customer_name=f"Dummy Customer {i}",
                customer_phone=f"555000{i:04d}",
                number_of_people=random.randint(1, 4),
                status="Completed"
            )
            session.add(session_obj)
            await session.commit()
            ids["CustomerSession"].append(session_obj.id)

            # Orders
            waiter = random.choice(waiters)
            num_orders = random.randint(1, 3)
            session_total = 0.0
            
            for o_idx in range(num_orders):
                order = Order(
                    session_id=session_obj.id,
                    waiter_id=waiter.id,
                    order_type="Dine-in",
                    status="Completed"
                )
                session.add(order)
                await session.commit()
                ids["Order"].append(order.id)

                history = OrderStatusHistory(order_id=order.id, status="Completed", changed_by_employee_id=waiter.id)
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
                        price_at_order=price_at_order
                    )
                    session.add(oi)
                    await session.commit()
                    ids["OrderItem"].append(oi.id)

            # Bill
            bill = Bill(
                session_id=session_obj.id,
                bill_number=f"DUMMY-BILL-{i}",
                generated_by_employee_id=employees[0].id, # Operator
                subtotal=session_total,
                total_tax=session_total * 0.1, # 10% tax
                total_discount=0,
                service_charge=0,
                grand_total=session_total * 1.1,
                payment_status="Paid"
            )
            session.add(bill)
            await session.commit()
            ids["Bill"].append(bill.id)

            # Bill Items (Simplified, normally derived from orders)
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

            # Payment
            payment = Payment(
                bill_id=bill.id,
                amount=bill.grand_total,
                payment_method=random.choice(["Cash", "Card", "UPI"]),
                transaction_id=f"DUMMY-TXN-{i}",
                status="Success"
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
