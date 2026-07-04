import json
from typing import Dict, List, Any
from fastapi import WebSocket

class ConnectionManager:
    def __init__(self):
        # Store active connections by role
        # e.g. self.active_connections["admin"] = [websocket1, websocket2]
        self.active_connections: Dict[str, List[WebSocket]] = {
            "admin": [],
            "operator": [],
            "waiter": [],
            "customer": [] # For customers, we might want to store by session_id in the future, but a flat list works for MVP broadcasts
        }
        
        # A map of websocket -> specific session_id for targeted customer messages
        self.customer_sessions: Dict[WebSocket, int] = {}

    async def connect(self, websocket: WebSocket, role: str, session_id: int = None):
        await websocket.accept()
        if role in self.active_connections:
            self.active_connections[role].append(websocket)
            if role == "customer" and session_id:
                self.customer_sessions[websocket] = session_id

    def disconnect(self, websocket: WebSocket, role: str):
        if role in self.active_connections and websocket in self.active_connections[role]:
            self.active_connections[role].remove(websocket)
        if websocket in self.customer_sessions:
            del self.customer_sessions[websocket]

    async def broadcast(self, event: str, payload: Any, target_roles: List[str] = None):
        message = json.dumps({"event": event, "payload": payload})
        
        roles_to_notify = target_roles if target_roles else ["admin", "operator", "waiter"]
        
        for role in roles_to_notify:
            if role in self.active_connections:
                # Iterate over a copy to handle disconnects during broadcast
                for connection in list(self.active_connections[role]):
                    try:
                        await connection.send_text(message)
                    except Exception:
                        self.disconnect(connection, role)
                        
    async def notify_customer(self, session_id: int, event: str, payload: Any):
        message = json.dumps({"event": event, "payload": payload})
        for connection, sid in list(self.customer_sessions.items()):
            if sid == session_id:
                try:
                    await connection.send_text(message)
                except Exception:
                    self.disconnect(connection, "customer")

manager = ConnectionManager()
