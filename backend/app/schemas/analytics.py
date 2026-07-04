from pydantic import BaseModel, ConfigDict
from typing import List, Optional
from datetime import date

class KPIData(BaseModel):
    total_revenue: float
    total_orders: int
    active_sessions: int
    completed_bills: int
    available_tables: int
    total_tables: int
    average_bill_value: float
    total_customers: int

class RevenueByDate(BaseModel):
    date: date
    revenue: float

class TopSellingItem(BaseModel):
    menu_item_id: int
    item_name: str
    total_quantity: int
    total_revenue: float

class CategoryRevenue(BaseModel):
    name: str
    value: float
    color: str

class TopWaiter(BaseModel):
    id: int
    name: str
    sales: float
    avatar: str

class TodaySummary(BaseModel):
    today_revenue: float
    today_orders: int
    today_bills: int
    today_discounts: float
    today_payments: float

class AnalyticsDashboardResponse(BaseModel):
    kpis: KPIData
    revenue_chart: List[RevenueByDate]
    top_selling_items: List[TopSellingItem]
    top_categories: List[CategoryRevenue]
    top_waiters: List[TopWaiter]
    today_summary: TodaySummary
