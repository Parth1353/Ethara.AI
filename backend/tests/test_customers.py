def customer_payload(**overrides):
    payload = {
        "full_name": "Aarav Mehta",
        "email": "aarav.mehta@example.com",
        "phone": "+91 98765 43210",
    }
    payload.update(overrides)
    return payload


def test_customer_create_list_get_delete(client):
    created = client.post("/customers", json=customer_payload()).json()

    assert created["id"] == 1
    assert created["email"] == "aarav.mehta@example.com"
    assert client.get("/customers").json()[0]["full_name"] == "Aarav Mehta"
    assert client.get(f"/customers/{created['id']}").json()["phone"] == "+91 98765 43210"

    response = client.delete(f"/customers/{created['id']}")
    assert response.status_code == 204
    assert client.get(f"/customers/{created['id']}").status_code == 404


def test_customer_email_must_be_unique(client):
    assert client.post("/customers", json=customer_payload()).status_code == 201
    response = client.post("/customers", json=customer_payload(full_name="Duplicate"))

    assert response.status_code == 409
    assert response.json()["detail"] == "Customer email must be unique."


def test_customer_email_must_be_valid(client):
    response = client.post("/customers", json=customer_payload(email="invalid"))

    assert response.status_code == 422
