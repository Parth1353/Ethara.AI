from datetime import datetime

from pydantic import BaseModel, ConfigDict, Field

from app.schemas.customer import CustomerRead


class OrderItemCreate(BaseModel):
    product_id: int
    quantity: int = Field(gt=0)


class OrderCreate(BaseModel):
    customer_id: int
    items: list[OrderItemCreate] = Field(min_length=1)


class OrderItemRead(BaseModel):
    product_id: int
    product_name: str
    sku: str
    quantity: int
    unit_price: float
    line_total: float

    model_config = ConfigDict(from_attributes=True)


class OrderRead(BaseModel):
    id: int
    customer: CustomerRead
    items: list[OrderItemRead]
    total_amount: float
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)
