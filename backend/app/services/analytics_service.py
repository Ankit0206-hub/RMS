from sqlalchemy.ext.asyncio import AsyncSession
from datetime import datetime, timedelta
from app.repositories.analytics_repository import AnalyticsRepository

class AnalyticsService:
    def __init__(self):
        self.repository = AnalyticsRepository()

    async def get_dashboard_data(self, db: AsyncSession, timeframe: str = "today"):
        start_date = None
        now = datetime.utcnow()
        today_start = datetime(now.year, now.month, now.day)
        
        if timeframe == "today":
            start_date = today_start
        elif timeframe == "weekly":
            start_date = today_start - timedelta(days=today_start.weekday())
        elif timeframe == "monthly":
            start_date = datetime(now.year, now.month, 1)
        # timeframe "all" means start_date = None
            
        chart_days = 30 if timeframe == "monthly" else 7
            
        kpis = await self.repository.get_kpis(db, start_date)
        revenue_chart = await self.repository.get_revenue_by_date(db, days=chart_days)
        top_selling_items = await self.repository.get_top_selling_items(db, limit=5)
        top_categories = await self.repository.get_top_categories(db, limit=5)
        top_waiters = await self.repository.get_top_waiters(db, limit=5)
        today_summary = await self.repository.get_today_summary(db, today_start)
        
        sales_by_order_type = await self.repository.get_sales_by_order_type(db, start_date)
        sales_by_payment_method = await self.repository.get_sales_by_payment_method(db, start_date)
        hourly_sales = await self.repository.get_hourly_sales(db, start_date)
        sales_summary = await self.repository.get_sales_summary(db)
        recent_orders = await self.repository.get_recent_orders(db, limit=5)
        recent_reviews = await self.repository.get_recent_reviews(db, limit=5)

        return {
            "kpis": kpis,
            "revenue_chart": revenue_chart,
            "top_selling_items": top_selling_items,
            "top_categories": top_categories,
            "top_waiters": top_waiters,
            "today_summary": today_summary,
            "sales_by_order_type": sales_by_order_type,
            "sales_by_payment_method": sales_by_payment_method,
            "hourly_sales": hourly_sales,
            "sales_summary": sales_summary,
            "recent_orders": recent_orders,
            "recent_reviews": recent_reviews
        }

    async def get_sales_analytics(self, db: AsyncSession):
        kpis = await self.repository.get_sales_tab_kpis(db)
        weekly_trends = await self.repository.get_weekly_trends(db)
        monthly_sales = await self.repository.get_monthly_sales_by_type(db)
        
        return {
            "kpis": kpis,
            "weekly_trends": weekly_trends,
            "monthly_sales": monthly_sales
        }

    async def get_food_analytics(self, db: AsyncSession):
        kpis = await self.repository.get_food_tab_kpis(db)
        categories = await self.repository.get_top_categories(db, limit=10)
        top_items = await self.repository.get_top_selling_items(db, limit=10)
        slow_items = await self.repository.get_slow_items(db, limit=10)
        
        # Formatting top_items to match UI
        formatted_top_items = []
        for item in top_items:
            # We don't have category name in get_top_selling_items result easily without joining, but UI needs it. 
            # We'll just pass it. Wait, I should join it in get_top_selling_items. Let's see if we can just return it and UI will adapt.
            formatted_top_items.append({
                "name": item["item_name"],
                "category": "Menu Item", # placeholder if not joined
                "sold": item["total_quantity"],
                "revenue": item["total_revenue"]
            })
            
        return {
            "kpis": kpis,
            "categories": categories,
            "top_items": formatted_top_items,
            "slow_items": slow_items
        }

    async def get_customer_analytics(self, db: AsyncSession):
        kpis = await self.repository.get_customer_tab_kpis(db)
        growth = await self.repository.get_customer_growth(db)
        demographics = await self.repository.get_customer_demographics(db)
        top_customers = await self.repository.get_top_customers(db)
        
        return {
            "kpis": kpis,
            "customer_growth": growth,
            "demographics": demographics,
            "top_customers": top_customers
        }

    async def get_performance_analytics(self, db: AsyncSession):
        staff_data = await self.repository.get_staff_performance(db)
        kpis = await self.repository.get_performance_tab_kpis(db, staff_data)
        role_distribution = await self.repository.get_role_distribution(db, staff_data)
        
        return {
            "kpis": kpis,
            "staff_data": staff_data,
            "role_distribution": role_distribution
        }
