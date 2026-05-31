def product_payload(**overrides):
    payload = {
        "name": "Wireless Barcode Scanner",
        "sku": "SCN-100",
        "price": 129.99,
        "quantity_in_stock": 12,
    }
    payload.update(overrides)
    return payload


def test_product_crud(client):
    created = client.post("/products", json=product_payload()).json()

    assert created["id"] == 1
    assert created["sku"] == "SCN-100"

    product_id = created["id"]
    assert client.get("/products").json()[0]["name"] == "Wireless Barcode Scanner"
    assert client.get(f"/products/{product_id}").json()["price"] == 129.99

    updated = client.put(
        f"/products/{product_id}",
        json=product_payload(name="Updated Scanner", sku="SCN-101", price=99.5, quantity_in_stock=4),
    ).json()

    assert updated["name"] == "Updated Scanner"
    assert updated["quantity_in_stock"] == 4

    response = client.delete(f"/products/{product_id}")
    assert response.status_code == 204
    assert client.get(f"/products/{product_id}").status_code == 404


def test_product_sku_must_be_unique(client):
    assert client.post("/products", json=product_payload()).status_code == 201
    response = client.post("/products", json=product_payload(name="Duplicate"))

    assert response.status_code == 409
    assert response.json()["detail"] == "Product SKU must be unique."


def test_product_quantity_cannot_be_negative(client):
    response = client.post("/products", json=product_payload(quantity_in_stock=-1))

    assert response.status_code == 422
