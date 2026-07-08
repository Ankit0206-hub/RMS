from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from app.db.database import get_db
from app.schemas.common import StandardResponse
from app.schemas.analytics import AnalyticsDashboardResponse, AnalyticsSalesResponse, AnalyticsFoodResponse, AnalyticsCustomerResponse, AnalyticsPerformanceResponse
from app.services.analytics_service import AnalyticsService

router = APIRouter(prefix="/analytics", tags=["Admin - Analytics"])
service = AnalyticsService()

@router.get("/dashboard", response_model=StandardResponse[AnalyticsDashboardResponse])
async def get_dashboard(timeframe: str = "all", db: AsyncSession = Depends(get_db)):
    data = await service.get_dashboard_data(db, timeframe)
    return StandardResponse(success=True, message="Dashboard data retrieved", data=data)

@router.get("/sales", response_model=StandardResponse[AnalyticsSalesResponse])
async def get_sales(db: AsyncSession = Depends(get_db)):
    data = await service.get_sales_analytics(db)
    return StandardResponse(success=True, message="Sales data retrieved", data=data)

@router.get("/food", response_model=StandardResponse[AnalyticsFoodResponse])
async def get_food(db: AsyncSession = Depends(get_db)):
    data = await service.get_food_analytics(db)
    return StandardResponse(success=True, message="Food data retrieved", data=data)

@router.get("/customers", response_model=StandardResponse[AnalyticsCustomerResponse])
async def get_customers(db: AsyncSession = Depends(get_db)):
    data = await service.get_customer_analytics(db)
    return StandardResponse(success=True, message="Customer data retrieved", data=data)

@router.get("/performance", response_model=StandardResponse[AnalyticsPerformanceResponse])
async def get_performance(db: AsyncSession = Depends(get_db)):
    data = await service.get_performance_analytics(db)
    return StandardResponse(success=True, message="Performance data retrieved", data=data)
