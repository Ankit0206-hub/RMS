from fastapi import APIRouter, Depends, HTTPException
from app.api.dependencies import get_current_admin_user
from app.models import User
import subprocess
import os

router = APIRouter()

@router.get("/")
async def get_container_logs(lines: int = 200, current_user: User = Depends(get_current_admin_user)):
    """
    Get the last N lines of the backend container logs.
    Restricted to admin users only.
    """
    log_file_path = "/app/app.log"
    
    if not os.path.exists(log_file_path):
        raise HTTPException(status_code=404, detail="Log file not found or hasn't been created yet.")
        
    try:
        # Use subprocess to tail the file efficiently without loading the whole thing into memory
        # We enforce a maximum of 1000 lines to prevent memory issues
        max_lines = min(lines, 1000)
        
        result = subprocess.run(
            ['tail', '-n', str(max_lines), log_file_path], 
            capture_output=True, 
            text=True,
            check=True
        )
        
        return {
            "status": "success",
            "lines_requested": max_lines,
            "logs": result.stdout
        }
    except subprocess.CalledProcessError as e:
        raise HTTPException(status_code=500, detail=f"Failed to read logs: {e.stderr}")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"An error occurred: {str(e)}")
