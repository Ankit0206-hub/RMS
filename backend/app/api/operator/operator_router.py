from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from app.db.database import get_db
from app.api.deps import get_current_operator
from app.models.security import Employee
from app.schemas.admin.employees import EmployeeUpdate, EmployeeResponse
from app.schemas.admin.settings import RestaurantSettingsUpdate, RestaurantSettingsResponse
from app.schemas.common import StandardResponse
from app.services.admin.settings_service import settings_service

router = APIRouter(prefix="/operator", tags=["Operator Portal"])

@router.get("/me")
async def get_me(current_user: Employee = Depends(get_current_operator)):
    return {"message": "Welcome Operator", "employee_code": current_user.employee_code}

@router.put("/me", response_model=EmployeeResponse)
async def update_me(
    update_data: EmployeeUpdate,
    current_user: Employee = Depends(get_current_operator),
    db: AsyncSession = Depends(get_db)
):
    if update_data.first_name is not None:
        current_user.first_name = update_data.first_name
    if update_data.last_name is not None:
        current_user.last_name = update_data.last_name
    if update_data.email is not None:
        current_user.email = update_data.email
    if update_data.phone is not None:
        current_user.phone = update_data.phone
    if update_data.image_url is not None:
        current_user.image_url = update_data.image_url
    
    # We do not allow changing role_id, password, or employee_code here,
    # or we handle them carefully if we wanted to.
    
    await db.commit()
    await db.refresh(current_user)
    
    # role_name property is handled if we load relations or we can just return it
    # We'll just return the updated user
    return current_user

@router.get("/settings", response_model=StandardResponse[RestaurantSettingsResponse])
async def get_operator_settings(
    db: AsyncSession = Depends(get_db),
    current_user: Employee = Depends(get_current_operator)
):
    data = await settings_service.get_settings(db)
    return StandardResponse(data=data)

@router.put("/settings", response_model=StandardResponse[RestaurantSettingsResponse])
async def update_operator_settings(
    settings_in: RestaurantSettingsUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: Employee = Depends(get_current_operator)
):
    data = await settings_service.update_settings(db, settings_in)
    return StandardResponse(data=data)

@router.post("/tables/{table_id}/clear")
async def clear_operator_table(
    table_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: Employee = Depends(get_current_operator)
):
    from sqlalchemy.future import select
    from fastapi import HTTPException
    from app.models.restaurant import RestaurantTable
    from app.models.ordering import CustomerSession
    from sqlalchemy.orm import selectinload
    from app.api.websocket_router import manager
    
    query = select(RestaurantTable).where(RestaurantTable.table_number == table_id).options(
        selectinload(RestaurantTable.sessions)
    )
    result = await db.execute(query)
    table = result.scalars().first()
    
    if not table:
        raise HTTPException(status_code=404, detail="Table not found")
        
    for session in table.sessions:
        if session.status == "Active":
            session.status = "Completed"
            
    table.status = "Available"
    await db.commit()
    
    await manager.broadcast("TABLE_UPDATED", {
        "table_id": table.table_number,
        "status": "Available"
    }, ["operator", "waiter", "kitchen"])
    
    return {"message": "Table cleared successfully"}
