def create_product(client, name="Wireless Barcode Scanner", sku="SCN-100", price=129.99, stock=12):
    return client.post(
        "/products",
        json={
            "name": name,
            "sku": sku,
            "price": price,
            "quantity_in_stock": stock,
        },
    ).json()


def create_customer(client):
    return client.post(
        "/customers",
        json={
            "full_name": "Aarav Mehta",
            "email": "aarav.mehta@example.com",
            "phone": "+91 98765 43210",
        },
    ).json()


def test_order_create_list_get_and_delete_restores_stock(client):
    customer = create_customer(client)
    scanner = create_product(client, stock=12)
    labels = create_product(client, name="Thermal Shipping Labels", sku="LBL-240", price=18.5, stock=4)

    created = client.post(
        "/orders",
        json={
            "customer_id": customer["id"],
            "items": [
                {"product_id": scanner["id"], "quantity": 2},
                {"product_id": labels["id"], "quantity": 3},
            ],
        },
    ).json()

    assert created["customer"]["full_name"] == "Aarav Mehta"
    assert created["total_amount"] == 315.48
    assert created["items"][0]["line_total"] == 259.98
    assert client.get(f"/products/{scanner['id']}").json()["quantity_in_stock"] == 10
    assert client.get(f"/products/{labels['id']}").json()["quantity_in_stock"] == 1
    assert client.get("/orders").json()[0]["id"] == created["id"]
    assert client.get(f"/orders/{created['id']}").json()["items"][1]["sku"] == "LBL-240"

    response = client.delete(f"/orders/{created['id']}")
    assert response.status_code == 204
    assert client.get(f"/products/{scanner['id']}").json()["quantity_in_stock"] == 12
    assert client.get(f"/products/{labels['id']}").json()["quantity_in_stock"] == 4


def test_order_rejects_insufficient_inventory(client):
    customer = create_customer(client)
    product = create_product(client, stock=2)

    response = client.post(
        "/orders",
        json={
            "customer_id": customer["id"],
            "items": [{"product_id": product["id"], "quantity": 3}],
        },
    )

    assert response.status_code == 409
    assert response.json()["detail"] == "Insufficient inventory for Wireless Barcode Scanner."
    assert client.get(f"/products/{product['id']}").json()["quantity_in_stock"] == 2


def test_order_rejects_missing_customer_and_product(client):
    customer = create_customer(client)

    missing_customer = client.post(
        "/orders",
        json={"customer_id": 999, "items": [{"product_id": 1, "quantity": 1}]},
    )
    missing_product = client.post(
        "/orders",
        json={"customer_id": customer["id"], "items": [{"product_id": 999, "quantity": 1}]},
    )

    assert missing_customer.status_code == 404
    assert missing_product.status_code == 404


def test_order_quantity_must_be_positive(client):
    customer = create_customer(client)
    product = create_product(client)

    response = client.post(
        "/orders",
        json={"customer_id": customer["id"], "items": [{"product_id": product["id"], "quantity": 0}]},
    )

    assert response.status_code == 422
