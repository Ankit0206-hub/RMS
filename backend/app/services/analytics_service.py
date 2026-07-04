from sqlalchemy.ext.asyncio import AsyncSession
from datetime import datetime
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
            
        kpis = await self.repository.get_kpis(db, start_date)
        revenue_chart = await self.repository.get_revenue_by_date(db, days=7)
        top_selling_items = await self.repository.get_top_selling_items(db, limit=5)
        top_categories = await self.repository.get_top_categories(db, limit=5)
        top_waiters = await self.repository.get_top_waiters(db, limit=5)
        today_summary = await self.repository.get_today_summary(db, today_start)

        return {
            "kpis": kpis,
            "revenue_chart": revenue_chart,
            "top_selling_items": top_selling_items,
            "top_categories": top_categories,
            "top_waiters": top_waiters,
            "today_summary": today_summary
        }
