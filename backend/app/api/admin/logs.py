from fastapi import APIRouter, Depends, HTTPException, Query
import os
from typing import List

# Assuming you have admin auth dependencies setup, you can add them here later
# from app.api.deps import get_current_active_admin

router = APIRouter()

@router.get("/")
async def get_backend_logs(lines: int = Query(100, description="Number of lines to return from the end of the log file")):
    """
    Retrieve the last N lines of the backend container logs.
    """
    log_file = "logs/backend.log"
    
    if not os.path.exists(log_file):
        return {"logs": ["Log file not found. The server might not have written to it yet, or the startup script wasn't updated."]}
    
    try:
        # We read the file and return the last `lines`
        with open(log_file, "r") as f:
            all_lines = f.readlines()
            
            # Get the last N lines
            recent_lines = all_lines[-lines:] if lines > 0 else all_lines
            
            return {
                "total_lines": len(all_lines),
                "returned_lines": len(recent_lines),
                "logs": recent_lines
            }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to read logs: {str(e)}")
