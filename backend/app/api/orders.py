from decimal import Decimal, ROUND_HALF_UP

from fastapi import APIRouter, Depends, Response, status
from sqlalchemy import select
from sqlalchemy.orm import Session, selectinload

from app.api.deps import conflict, not_found
from app.db.session import get_db
from app.models import Customer, Order, OrderItem, Product
from app.schemas.customer import CustomerRead
from app.schemas.order import OrderCreate, OrderRead

router = APIRouter(prefix="/orders", tags=["orders"])


def money(value) -> Decimal:
    return Decimal(str(value)).quantize(Decimal("0.01"), rounding=ROUND_HALF_UP)


def order_to_read(order: Order) -> OrderRead:
    customer = CustomerRead(
        id=order.customer_id or 0,
        full_name=order.customer_full_name,
        email=order.customer_email,
        phone=order.customer_phone,
        created_at=order.created_at,
    )
    return OrderRead(
        id=order.id,
        customer=customer,
        items=order.items,
        total_amount=float(order.total_amount),
        created_at=order.created_at,
    )


def order_query():
    return select(Order).options(selectinload(Order.items)).order_by(Order.created_at.desc(), Order.id.desc())


def get_order_or_404(db: Session, order_id: int) -> Order:
    order = db.scalar(select(Order).options(selectinload(Order.items)).where(Order.id == order_id))
    if order is None:
        raise not_found("Order not found.")
    return order


@router.post("", response_model=OrderRead, status_code=status.HTTP_201_CREATED)
def create_order(payload: OrderCreate, db: Session = Depends(get_db)) -> OrderRead:
    customer = db.get(Customer, payload.customer_id)
    if customer is None:
        raise not_found("Customer not found.")

    grouped_items: dict[int, int] = {}
    for item in payload.items:
        grouped_items[item.product_id] = grouped_items.get(item.product_id, 0) + item.quantity

    products = list(
        db.scalars(
            select(Product)
            .where(Product.id.in_(grouped_items.keys()))
            .with_for_update()
        ).all()
    )
    products_by_id = {product.id: product for product in products}
    missing_product_ids = [product_id for product_id in grouped_items if product_id not in products_by_id]
    if missing_product_ids:
        raise not_found("Product not found.")

    total_amount = Decimal("0.00")
    order_items: list[OrderItem] = []

    for product_id, quantity in grouped_items.items():
        product = products_by_id[product_id]
        if product.quantity_in_stock < quantity:
            raise conflict(f"Insufficient inventory for {product.name}.")
        unit_price = money(product.price)
        line_total = money(unit_price * quantity)
        total_amount += line_total
        product.quantity_in_stock -= quantity
        order_items.append(
            OrderItem(
                product_id=product.id,
                product_name=product.name,
                sku=product.sku,
                quantity=quantity,
                unit_price=unit_price,
                line_total=line_total,
            )
        )

    order = Order(
        customer_id=customer.id,
        customer_full_name=customer.full_name,
        customer_email=customer.email,
        customer_phone=customer.phone,
        total_amount=money(total_amount),
        items=order_items,
    )
    db.add(order)
    db.commit()
    db.refresh(order)
    order = get_order_or_404(db, order.id)
    return order_to_read(order)


@router.get("", response_model=list[OrderRead])
def list_orders(db: Session = Depends(get_db)) -> list[OrderRead]:
    orders = list(db.scalars(order_query()).unique().all())
    return [order_to_read(order) for order in orders]


@router.get("/{order_id}", response_model=OrderRead)
def get_order(order_id: int, db: Session = Depends(get_db)) -> OrderRead:
    return order_to_read(get_order_or_404(db, order_id))


@router.delete("/{order_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_order(order_id: int, db: Session = Depends(get_db)) -> Response:
    order = get_order_or_404(db, order_id)
    product_ids = [item.product_id for item in order.items]
    products = list(db.scalars(select(Product).where(Product.id.in_(product_ids)).with_for_update()).all())
    products_by_id = {product.id: product for product in products}

    for item in order.items:
        product = products_by_id.get(item.product_id)
        if product is not None:
            product.quantity_in_stock += item.quantity

    db.delete(order)
    db.commit()
    return Response(status_code=status.HTTP_204_NO_CONTENT)
