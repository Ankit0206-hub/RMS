from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from app.db.database import get_db
from app.schemas.common import StandardResponse
from app.schemas.analytics import AnalyticsDashboardResponse
from app.services.analytics_service import AnalyticsService

router = APIRouter(prefix="/analytics", tags=["Admin - Analytics"])
service = AnalyticsService()

@router.get("/dashboard", response_model=StandardResponse[AnalyticsDashboardResponse])
async def get_dashboard(timeframe: str = "all", db: AsyncSession = Depends(get_db)):
    data = await service.get_dashboard_data(db, timeframe)
    return StandardResponse(success=True, message="Dashboard data retrieved", data=data)
