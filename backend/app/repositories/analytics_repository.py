from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, and_
from datetime import datetime, timedelta, date
from typing import List, Dict, Any
from app.models.billing import Bill, BillItem, Payment, Discount
from app.models.ordering import Order, CustomerSession
from app.models.security import Employee
from app.models.restaurant import RestaurantTable
from app.models.menu import MenuCategory, MenuItem

class AnalyticsRepository:
    async def get_kpis(self, db: AsyncSession, start_date: datetime = None) -> Dict[str, Any]:
        # Base queries
        revenue_stmt = select(func.sum(Bill.grand_total)).where(Bill.payment_status == 'Paid')
        orders_stmt = select(func.count(Order.id)).where(Order.status != 'Cancelled')
        sessions_stmt = select(func.count(CustomerSession.id)).where(CustomerSession.status == 'Active')
        completed_bills_stmt = select(func.count(Bill.id)).where(Bill.payment_status == 'Paid')
        total_customers_stmt = select(func.sum(CustomerSession.number_of_people)).where(CustomerSession.status != 'Cancelled')
        avg_bill_stmt = select(func.avg(Bill.grand_total)).where(Bill.payment_status == 'Paid')
        available_tables_stmt = select(func.count(RestaurantTable.id)).where(RestaurantTable.status == 'Available')
        total_tables_stmt = select(func.count(RestaurantTable.id))

        # Add date filtering if provided
        if start_date:
            revenue_stmt = revenue_stmt.where(Bill.generated_at >= start_date)
            orders_stmt = orders_stmt.where(Order.created_at >= start_date)
            completed_bills_stmt = completed_bills_stmt.where(Bill.generated_at >= start_date)
            avg_bill_stmt = avg_bill_stmt.where(Bill.generated_at >= start_date)

        # Execute queries
        total_revenue = await db.scalar(revenue_stmt) or 0.0
        total_orders = await db.scalar(orders_stmt) or 0
        active_sessions = await db.scalar(sessions_stmt) or 0
        completed_bills = await db.scalar(completed_bills_stmt) or 0
        total_customers = await db.scalar(total_customers_stmt) or 0
        avg_bill = await db.scalar(avg_bill_stmt) or 0.0
        available_tables = await db.scalar(available_tables_stmt) or 0
        total_tables = await db.scalar(total_tables_stmt) or 0

        return {
            "total_revenue": float(total_revenue),
            "total_orders": total_orders,
            "active_sessions": active_sessions,
            "completed_bills": completed_bills,
            "available_tables": available_tables,
            "total_tables": total_tables,
            "average_bill_value": float(avg_bill),
            "total_customers": int(total_customers)
        }

    async def get_today_summary(self, db: AsyncSession, start_date: datetime) -> Dict[str, Any]:
        revenue_stmt = select(func.sum(Bill.grand_total)).where(Bill.payment_status == 'Paid', Bill.generated_at >= start_date)
        orders_stmt = select(func.count(Order.id)).where(Order.status != 'Cancelled', Order.created_at >= start_date)
        bills_stmt = select(func.count(Bill.id)).where(Bill.payment_status == 'Paid', Bill.generated_at >= start_date)
        discounts_stmt = select(func.sum(Bill.total_discount)).where(Bill.payment_status == 'Paid', Bill.generated_at >= start_date)
        payments_stmt = select(func.sum(Payment.amount)).where(Payment.status == 'Success', Payment.created_at >= start_date)

        today_revenue = await db.scalar(revenue_stmt) or 0.0
        today_orders = await db.scalar(orders_stmt) or 0
        today_bills = await db.scalar(bills_stmt) or 0
        today_discounts = await db.scalar(discounts_stmt) or 0.0
        today_payments = await db.scalar(payments_stmt) or 0.0

        return {
            "today_revenue": float(today_revenue),
            "today_orders": today_orders,
            "today_bills": today_bills,
            "today_discounts": float(today_discounts),
            "today_payments": float(today_payments)
        }

    async def get_revenue_by_date(self, db: AsyncSession, days: int = 7) -> List[Dict[str, Any]]:
        start_date = datetime.utcnow() - timedelta(days=days)
        
        stmt = (
            select(
                func.date(Bill.generated_at).label("date"),
                func.sum(Bill.grand_total).label("revenue")
            )
            .where(Bill.payment_status == 'Paid', Bill.generated_at >= start_date)
            .group_by(func.date(Bill.generated_at))
            .order_by(func.date(Bill.generated_at))
        )
        
        result = await db.execute(stmt)
        return [{"date": row.date, "revenue": float(row.revenue)} for row in result.all()]

    async def get_top_selling_items(self, db: AsyncSession, limit: int = 5) -> List[Dict[str, Any]]:
        stmt = (
            select(
                BillItem.menu_item_id,
                BillItem.item_name,
                func.sum(BillItem.quantity).label("total_quantity"),
                func.sum(BillItem.total).label("total_revenue")
            )
            .join(Bill, Bill.id == BillItem.bill_id)
            .where(Bill.payment_status == 'Paid')
            .group_by(BillItem.menu_item_id, BillItem.item_name)
            .order_by(func.sum(BillItem.quantity).desc())
            .limit(limit)
        )
        
        result = await db.execute(stmt)
        return [
            {
                "menu_item_id": row.menu_item_id or 0,
                "item_name": row.item_name,
                "total_quantity": row.total_quantity,
                "total_revenue": float(row.total_revenue)
            } 
            for row in result.all()
        ]

    async def get_top_categories(self, db: AsyncSession, limit: int = 5) -> List[Dict[str, Any]]:
        stmt = (
            select(
                MenuCategory.name,
                func.sum(BillItem.total).label("value")
            )
            .join(MenuItem, MenuItem.category_id == MenuCategory.id)
            .join(BillItem, BillItem.menu_item_id == MenuItem.id)
            .join(Bill, Bill.id == BillItem.bill_id)
            .where(Bill.payment_status == 'Paid')
            .group_by(MenuCategory.name)
            .order_by(func.sum(BillItem.total).desc())
            .limit(limit)
        )
        
        result = await db.execute(stmt)
        colors = ["#ec4899", "#8b5cf6", "#3b82f6", "#10b981", "#f59e0b", "#6366f1"]
        return [
            {
                "name": row.name,
                "value": float(row.value),
                "color": colors[idx % len(colors)]
            }
            for idx, row in enumerate(result.all())
        ]

    async def get_top_waiters(self, db: AsyncSession, limit: int = 5) -> List[Dict[str, Any]]:
        stmt = (
            select(
                Employee.id,
                Employee.first_name,
                Employee.last_name,
                func.sum(Bill.grand_total).label("sales")
            )
            .join(Order, Order.waiter_id == Employee.id)
            .join(CustomerSession, CustomerSession.id == Order.session_id)
            .join(Bill, Bill.session_id == CustomerSession.id)
            .where(Bill.payment_status == 'Paid')
            .group_by(Employee.id, Employee.first_name, Employee.last_name)
            .order_by(func.sum(Bill.grand_total).desc())
            .limit(limit)
        )

        result = await db.execute(stmt)
        return [
            {
                "id": row.id,
                "name": f"{row.first_name} {row.last_name}",
                "sales": float(row.sales),
                "avatar": f"https://api.dicebear.com/7.x/avataaars/svg?seed={row.first_name}{row.last_name}"
            }
            for row in result.all()
        ]
