from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from sqlalchemy.orm import selectinload
from typing import Any, Dict
from datetime import datetime, timedelta, date

from app.db.database import get_db
from app.models.ordering import Order, OrderStatusHistory
from app.api.deps import get_current_admin

router = APIRouter()

@router.get("/dashboard", response_model=Dict[str, Any])
async def get_kitchen_dashboard(
    db: AsyncSession = Depends(get_db),
    current_admin: dict = Depends(get_current_admin)
):
    """
    Get live kitchen dashboard metrics.
    """
    today_start = datetime.combine(date.today(), datetime.min.time())
    
    # 1. Active Orders in Kitchen (Status: Confirmed)
    active_orders_query = select(Order).filter(
        Order.status == "Confirmed"
    )
    result = await db.execute(active_orders_query)
    active_orders_count = len(result.scalars().all())

    # 2. Delayed Orders (> 20 mins since Confirmed)
    # We find orders currently "Confirmed" and check their history
    delayed_count = 0
    twenty_mins_ago = datetime.utcnow() - timedelta(minutes=20)
    
    active_orders_with_history = await db.execute(
        select(Order).options(selectinload(Order.status_history)).filter(
            Order.status == "Confirmed"
        )
    )
    for order in active_orders_with_history.scalars().all():
        confirmed_history = next((h for h in order.status_history if h.status == "Confirmed"), None)
        if confirmed_history and confirmed_history.changed_at < twenty_mins_ago:
            delayed_count += 1

    # 3. Average Prep Time Today
    # We find orders today that have reached "Cooked" or beyond, and calculate time from Confirmed to Cooked
    prep_times = []
    completed_orders_query = select(Order).options(selectinload(Order.status_history)).filter(
        Order.created_at >= today_start,
        Order.status.in_(["Cooked", "Served", "Completed"])
    )
    completed_orders_result = await db.execute(completed_orders_query)
    
    for order in completed_orders_result.scalars().all():
        confirmed_hist = next((h for h in order.status_history if h.status == "Confirmed"), None)
        cooked_hist = next((h for h in order.status_history if h.status == "Cooked"), None)
        
        if confirmed_hist and cooked_hist:
            diff = (cooked_hist.changed_at - confirmed_hist.changed_at).total_seconds()
            if diff > 0:
                prep_times.append(diff)
                
    avg_prep_time_seconds = sum(prep_times) / len(prep_times) if prep_times else 0
    avg_prep_time_mins = round(avg_prep_time_seconds / 60)

    # Completed today
    completed_today_query = select(func.count(Order.id)).filter(
        Order.created_at >= today_start,
        Order.status.in_(["Cooked", "Served", "Completed"])
    )
    completed_today_result = await db.execute(completed_today_query)
    completed_today = completed_today_result.scalar() or 0

    return {
        "data": {
            "activeOrders": active_orders_count,
            "delayedOrders": delayed_count,
            "averagePrepTimeMins": avg_prep_time_mins,
            "completedToday": completed_today
        }
    }

@router.get("/performance", response_model=Dict[str, Any])
async def get_kitchen_performance(
    days: int = Query(7, ge=1, le=30),
    db: AsyncSession = Depends(get_db),
    current_admin: dict = Depends(get_current_admin)
):
    """
    Get kitchen performance metrics over the last N days.
    """
    end_date = datetime.utcnow()
    start_date = end_date - timedelta(days=days)
    
    orders_query = select(Order).options(selectinload(Order.status_history)).filter(
        Order.created_at >= start_date,
        Order.status.in_(["Cooked", "Served", "Completed"])
    )
    result = await db.execute(orders_query)
    orders = result.scalars().all()
    
    # Group prep times by date
    daily_stats = {}
    for i in range(days):
        d = (end_date - timedelta(days=i)).date()
        daily_stats[d.isoformat()] = {"total_orders": 0, "total_time": 0}
        
    for order in orders:
        order_date = order.created_at.date().isoformat()
        if order_date in daily_stats:
            confirmed_hist = next((h for h in order.status_history if h.status == "Confirmed"), None)
            cooked_hist = next((h for h in order.status_history if h.status == "Cooked"), None)
            
            if confirmed_hist and cooked_hist:
                diff = (cooked_hist.changed_at - confirmed_hist.changed_at).total_seconds()
                if diff > 0:
                    daily_stats[order_date]["total_orders"] += 1
                    daily_stats[order_date]["total_time"] += diff
                    
    trend = []
    for d in sorted(daily_stats.keys()):
        stats = daily_stats[d]
        avg_time = (stats["total_time"] / stats["total_orders"]) / 60 if stats["total_orders"] > 0 else 0
        trend.append({
            "date": d,
            "averagePrepTime": round(avg_time, 1),
            "completedOrders": stats["total_orders"]
        })
        
    return {
        "data": {
            "trend": trend
        }
    }
