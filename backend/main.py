from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings

from app.api.admin import auth as admin_auth
from app.api.admin import employees as admin_employees
from app.api.admin import settings as admin_settings
from app.api.admin import tables as admin_tables
from app.api.admin import categories as admin_categories
from app.api.admin import menu as admin_menu
from app.api.admin import ordering as admin_ordering
from app.api.admin import billing as admin_billing
from app.api.admin import analytics as admin_analytics
from app.api.admin import reservations as admin_reservations
from app.api.admin import notifications as admin_notifications
from app.api.admin import kitchen as admin_kitchen
from app.api.operator import operator_router
from app.api.waiter import waiter_router
from app.api.customer import customer_router
from app.api.customer import reviews as customer_reviews
from app.api.admin import reviews as admin_reviews
from app.api import websocket_router

from fastapi.exceptions import RequestValidationError
from sqlalchemy.exc import SQLAlchemyError
from app.core.exceptions import (
    BusinessException, 
    business_exception_handler, 
    validation_exception_handler, 
    sqlalchemy_exception_handler, 
    general_exception_handler
)

app = FastAPI(
    title=settings.PROJECT_NAME,
    version="1.0.0",
    description="Restaurant ERP Master API",
)

app.add_exception_handler(BusinessException, business_exception_handler)
app.add_exception_handler(RequestValidationError, validation_exception_handler)
app.add_exception_handler(SQLAlchemyError, sqlalchemy_exception_handler)
app.add_exception_handler(Exception, general_exception_handler)

import json
    
def parse_cors(origins_str):
    if not origins_str:
        return ["*"]
    if origins_str.startswith("["):
        try:
            return json.loads(origins_str)
        except Exception:
            pass
    return [origin.strip() for origin in origins_str.split(",")]

app.add_middleware(
    CORSMiddleware,
    allow_origins=parse_cors(settings.CORS_ORIGINS),
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(admin_auth.router, prefix="/api/v1/admin/auth", tags=["Admin Auth"])
app.include_router(admin_employees.router, prefix="/api/v1/admin/employees", tags=["Admin Employees"])
app.include_router(admin_settings.router, prefix="/api/v1/admin/settings", tags=["Admin Settings"])
app.include_router(admin_tables.router, prefix="/api/v1/admin/tables", tags=["Admin Tables"])
app.include_router(admin_categories.router, prefix="/api/v1/admin/categories", tags=["Admin Categories"])
app.include_router(admin_menu.router, prefix="/api/v1/admin/menu", tags=["Admin Menu"])
app.include_router(admin_ordering.router, prefix="/api/v1/admin", tags=["Admin Ordering"])
app.include_router(admin_billing.router, prefix="/api/v1/admin", tags=["Admin Billing"])
app.include_router(admin_analytics.router, prefix="/api/v1/admin", tags=["Admin Analytics"])
app.include_router(admin_reservations.router, prefix="/api/v1/admin/reservations", tags=["Admin Reservations"])
app.include_router(admin_notifications.router, prefix="/api/v1/admin/notifications", tags=["Admin Notifications"])
app.include_router(admin_kitchen.router, prefix="/api/v1/admin/kitchen", tags=["Admin Kitchen"])
app.include_router(operator_router.router, prefix="/api/v1", tags=["Operator"])
app.include_router(waiter_router.router, prefix="/api/v1", tags=["Waiter"])
app.include_router(customer_router.router, prefix="/api/v1/customer", tags=["Customer"])
app.include_router(customer_reviews.router, prefix="/api/v1/customer", tags=["Customer"])
app.include_router(admin_reviews.router, prefix="/api/v1/admin", tags=["Admin Reviews"])
app.include_router(websocket_router.router, prefix="/api/v1", tags=["WebSockets"])

@app.get("/")
async def root():
    return {"message": "Welcome to the Restaurant ERP API"}
