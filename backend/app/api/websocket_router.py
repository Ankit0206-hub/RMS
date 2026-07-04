from fastapi import APIRouter, WebSocket, WebSocketDisconnect, Query
from jose import jwt, JWTError
from app.core.config import settings
from app.websocket.connection_manager import manager

router = APIRouter()

async def verify_token(websocket: WebSocket, token: str) -> str:
    """Verify the JWT token and return the role. Raises exception on failure."""
    try:
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
        role: str = payload.get("role")
        if not role:
            await websocket.close(code=1008)
            return None
        return role
    except JWTError:
        await websocket.close(code=1008)
        return None

@router.websocket("/ws/admin")
async def websocket_admin(websocket: WebSocket, token: str = Query(...)):
    role = await verify_token(websocket, token)
    if role != "admin":
        await websocket.close(code=1008)
        return
        
    await manager.connect(websocket, "admin")
    try:
        while True:
            # We don't expect many messages from clients for MVP, just keep connection open
            data = await websocket.receive_text()
    except WebSocketDisconnect:
        manager.disconnect(websocket, "admin")

@router.websocket("/ws/operator")
async def websocket_operator(websocket: WebSocket, token: str = Query(...)):
    role = await verify_token(websocket, token)
    # Allow admins to connect as operators for testing flexibility
    if role not in ["operator", "admin", "employee"]: 
        await websocket.close(code=1008)
        return
        
    await manager.connect(websocket, "operator")
    try:
        while True:
            data = await websocket.receive_text()
    except WebSocketDisconnect:
        manager.disconnect(websocket, "operator")

@router.websocket("/ws/waiter")
async def websocket_waiter(websocket: WebSocket, token: str = Query(...)):
    role = await verify_token(websocket, token)
    if role not in ["waiter", "admin", "employee"]:
        await websocket.close(code=1008)
        return
        
    await manager.connect(websocket, "waiter")
    try:
        while True:
            data = await websocket.receive_text()
    except WebSocketDisconnect:
        manager.disconnect(websocket, "waiter")

@router.websocket("/ws/customer")
async def websocket_customer(websocket: WebSocket, session_id: int = Query(...)):
    # Customers authenticate via a valid session_id query param
    await manager.connect(websocket, "customer", session_id=session_id)
    try:
        while True:
            data = await websocket.receive_text()
    except WebSocketDisconnect:
        manager.disconnect(websocket, "customer")
