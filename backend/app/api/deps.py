from typing import Generator, AsyncGenerator
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from jose import jwt, JWTError
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy.orm import selectinload

from app.core.config import settings
from app.db.database import get_db
from app.models.security import Admin, Employee

oauth2_scheme = OAuth2PasswordBearer(tokenUrl=f"/api/v1/auth/login")

async def get_current_user(
    db: AsyncSession = Depends(get_db),
    token: str = Depends(oauth2_scheme)
) -> dict:
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
        user_id: str = payload.get("sub")
        role: str = payload.get("role")
        if user_id is None or role is None:
            raise credentials_exception
    except JWTError:
        raise credentials_exception

    if role == "admin":
        result = await db.execute(select(Admin).filter(Admin.id == int(user_id)))
        user = result.scalar_one_or_none()
    elif role == "employee":
        result = await db.execute(select(Employee).options(selectinload(Employee.role)).filter(Employee.id == int(user_id)))
        user = result.scalar_one_or_none()
    else:
        raise credentials_exception

    if user is None:
        raise credentials_exception
    if not user.is_active:
        raise HTTPException(status_code=400, detail="Inactive user")

    return {"user": user, "role": role}

async def get_current_admin(current_user: dict = Depends(get_current_user)) -> Admin:
    if current_user["role"] != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="The user doesn't have enough privileges"
        )
    return current_user["user"]

async def get_current_operator(current_user: dict = Depends(get_current_user)) -> Employee:
    if current_user["role"] != "employee" or not current_user["user"].role or current_user["user"].role.name.lower() != "operator":
        # Allow admin as fallback for testing/flexibility (Optional, but good for MVP)
        if current_user["role"] == "admin":
            return current_user["user"]
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Requires Operator privileges"
        )
    return current_user["user"]

async def get_strict_operator(current_user: dict = Depends(get_current_user)) -> Employee:
    if current_user["role"] != "employee" or not current_user["user"].role or current_user["user"].role.name.lower() != "operator":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Requires strict Operator privileges"
        )
    return current_user["user"]

async def get_current_admin_or_operator(current_user: dict = Depends(get_current_user)):
    if current_user["role"] == "admin":
        return current_user["user"]
    if current_user["role"] == "employee" and current_user["user"].role and current_user["user"].role.name.lower() == "operator":
        return current_user["user"]
    raise HTTPException(
        status_code=status.HTTP_403_FORBIDDEN,
        detail="Requires Admin or Operator privileges"
    )

async def get_current_staff(current_user: dict = Depends(get_current_user)):
    # Allows admin, operator, waiter, kitchen (any authenticated internal user)
    if current_user["role"] in ["admin", "employee"]:
        return current_user["user"]
    raise HTTPException(
        status_code=status.HTTP_403_FORBIDDEN,
        detail="Requires internal staff privileges"
    )

async def get_current_waiter(current_user: dict = Depends(get_current_user)) -> Employee:
    if current_user["role"] != "employee" or not current_user["user"].role or current_user["user"].role.name.lower() != "waiter":
        if current_user["role"] == "admin":
            return current_user["user"]
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Requires Waiter privileges"
        )
    return current_user["user"]

async def get_current_kitchen(current_user: dict = Depends(get_current_user)) -> Employee:
    if current_user["role"] != "employee" or not current_user["user"].role or current_user["user"].role.name.lower() not in ["kitchen", "kitchen staff"]:
        if current_user["role"] == "admin":
            return current_user["user"]
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Requires Kitchen privileges"
        )
    return current_user["user"]
async def get_current_customer_session(
    db: AsyncSession = Depends(get_db),
    token: str = Depends(oauth2_scheme)
):
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate customer session",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
        session_id: str = payload.get("sub")
        role: str = payload.get("role")
        if session_id is None or role != "customer":
            raise credentials_exception
    except JWTError:
        raise credentials_exception

    from app.models.ordering import CustomerSession
    result = await db.execute(select(CustomerSession).options(selectinload(CustomerSession.table)).filter(CustomerSession.id == int(session_id)))
    session = result.scalar_one_or_none()

    if session is None:
        raise credentials_exception
    
    return session
