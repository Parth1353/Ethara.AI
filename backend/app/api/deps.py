from fastapi import HTTPException, status
from sqlalchemy.exc import IntegrityError


def conflict(message: str) -> HTTPException:
    return HTTPException(status_code=status.HTTP_409_CONFLICT, detail=message)


def not_found(message: str) -> HTTPException:
    return HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=message)


def validation_error(message: str) -> HTTPException:
    return HTTPException(status_code=status.HTTP_422_UNPROCESSABLE_ENTITY, detail=message)


def handle_integrity_error(error: IntegrityError, fallback: str) -> None:
    message = str(error.orig).lower()
    if "products" in message and "sku" in message:
        raise conflict("Product SKU must be unique.") from error
    if "customers" in message and "email" in message:
        raise conflict("Customer email must be unique.") from error
    raise conflict(fallback) from error
