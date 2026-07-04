from fastapi import Request, status
from fastapi.responses import JSONResponse
from fastapi.exceptions import RequestValidationError
from sqlalchemy.exc import SQLAlchemyError
from app.core.logging import logger

class BusinessException(Exception):
    def __init__(self, detail: str, status_code: int = status.HTTP_400_BAD_REQUEST):
        self.detail = detail
        self.status_code = status_code

class BusinessRuleException(BusinessException):
    def __init__(self, detail: str):
        super().__init__(detail=detail, status_code=status.HTTP_400_BAD_REQUEST)

class NotFoundException(BusinessException):
    def __init__(self, detail: str):
        super().__init__(detail=detail, status_code=status.HTTP_404_NOT_FOUND)

async def business_exception_handler(request: Request, exc: BusinessException):
    logger.warning(f"BusinessException: {exc.detail}")
    return JSONResponse(
        status_code=exc.status_code,
        content={"success": False, "message": exc.detail, "errors": [exc.detail]},
    )

async def validation_exception_handler(request: Request, exc: RequestValidationError):
    logger.warning(f"ValidationException: {exc.errors()}")
    return JSONResponse(
        status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
        content={"success": False, "message": "Validation failed", "errors": exc.errors()},
    )

async def sqlalchemy_exception_handler(request: Request, exc: SQLAlchemyError):
    logger.error(f"SQLAlchemyError: {str(exc)}")
    return JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content={"success": False, "message": "Database error occurred", "errors": [str(exc)]},
    )

async def general_exception_handler(request: Request, exc: Exception):
    logger.error(f"Unhandled Exception: {str(exc)}", exc_info=True)
    return JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content={"success": False, "message": "An internal server error occurred", "errors": [str(exc)]},
    )
