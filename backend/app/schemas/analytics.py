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

class OrderTypeSales(BaseModel):
    name: str
    value: float
    color: str

class PaymentMethodSales(BaseModel):
    name: str
    amount: float
    percent: str
    formatted_amount: str

class HourlySales(BaseModel):
    name: str
    sales: float

class SalesSummary(BaseModel):
    this_week: float
    last_week: float
    growth: float
    trend: str

class AnalyticsDashboardResponse(BaseModel):
    kpis: KPIData
    revenue_chart: List[RevenueByDate]
    top_selling_items: List[TopSellingItem]
    top_categories: List[CategoryRevenue]
    top_waiters: List[TopWaiter]
    today_summary: TodaySummary
    sales_by_order_type: List[OrderTypeSales]
    sales_by_payment_method: List[PaymentMethodSales]
    hourly_sales: List[HourlySales]
    sales_summary: SalesSummary

class SalesTabKPIs(BaseModel):
    total_revenue_mtd: float
    avg_daily_sales: float
    projected_eom: float
    highest_sales_day: str

class WeeklyTrend(BaseModel):
    name: str
    sales: float

class MonthlySalesByType(BaseModel):
    name: str
    dineIn: float
    takeaway: float
    delivery: float

class AnalyticsSalesResponse(BaseModel):
    kpis: SalesTabKPIs
    weekly_trends: List[WeeklyTrend]
    monthly_sales: List[MonthlySalesByType]

class FoodTabKPIs(BaseModel):
    total_menu_items: int
    total_categories: int
    top_category: str
    least_selling: str

class FoodItemStat(BaseModel):
    name: str
    category: str
    sold: int
    revenue: float

class AnalyticsFoodResponse(BaseModel):
    kpis: FoodTabKPIs
    categories: List[CategoryRevenue]
    top_items: List[FoodItemStat]
    slow_items: List[FoodItemStat]

class CustomerTabKPIs(BaseModel):
    total_customers: int
    new_this_month: int
    retention_rate: float
    top_location: str

class CustomerGrowthStat(BaseModel):
    name: str
    new: int
    returning: int

class DemographicsStat(BaseModel):
    name: str
    value: int
    color: str

class TopCustomer(BaseModel):
    name: str
    phone: str
    visits: int
    spent: float
    loyalty: str

class AnalyticsCustomerResponse(BaseModel):
    kpis: CustomerTabKPIs
    customer_growth: List[CustomerGrowthStat]
    demographics: List[DemographicsStat]
    top_customers: List[TopCustomer]

class PerformanceTabKPIs(BaseModel):
    total_staff_active: int
    avg_rating: float
    avg_orders_per_staff: int
    top_performer: str

class StaffPerformanceStat(BaseModel):
    name: str
    role: str
    orders: int
    sales: float
    avg: float
    rating: float
    status: str

class RoleDistributionStat(BaseModel):
    waiters_active: int
    waiters_pct: float
    operators_active: int
    operators_pct: float

class AnalyticsPerformanceResponse(BaseModel):
    kpis: PerformanceTabKPIs
    staff_data: List[StaffPerformanceStat]
    role_distribution: RoleDistributionStat
