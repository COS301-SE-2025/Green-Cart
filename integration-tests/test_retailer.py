import sys
import os
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def test_fetch_metrics_standard_response():
    response = client.get("retailer/metrics/19")
    assert response.status_code == 200

def test_fetch_metrics_invalid_retailer():
    response = client.get("retailer/metrics/9999")
    assert response.status_code != 404

def test_get_retailer_by_user_id_standard_response():
    response = client.get("retailer/by-user/e1ca2b93-314f-4a71-b6fb-3bb430157b1f")
    assert response.status_code == 200

def test_get_retailer_by_user_id_response():
    response = client.get("retailer/by-user/e1ca2b93-314f-4a71-b6fb-3bb430157b1f")
    assert response.status_code == 200

def test_get_retailer_by_user_id_not_found():
    response = client.get("retailer/by-user/invalid-user-id")
    assert response.status_code == 404
    assert response.json() == {
        "detail": "Retailer not found for this user"
    }

def test_register_retailer():
    form_data = {
        "user_id": "e1ca2b93-314f-4a71-b6fb-3bb430157b1f",
        "name": "Test Retailer",
        "description": "This is a test retailer for integration testing."
    }

    image_path = os.path.join(os.path.dirname(__file__), "test_image.png")
    
    with open(image_path, "wb") as f:
        f.write(b"\x89PNG\r\n\x1a\n\x00\x00\x00\rIHDR\x00\x00\x00\x01\x00\x00\x00\x01\x08\x02\x00\x00\x00\x90wS\xde\x00\x00\x00\nIDATx\xdac\xfc\xff\xff?\x00\x05\xfe\x02\xfeA\x0b\x0e\x1b\x00\x00\x00\x00IEND\xaeB`\x82")
    with open(image_path, "rb") as img:
        response = client.post(
            "retailer/register",
            data=form_data,
            files={"banner_image": ("test_image.png", img, "image/png")}
        )
    os.remove(image_path)
    assert response.status_code == 200

def test_register_retailer_invalid_user_id():
    form_data = {
        "user_id": "invalid-user-id",
        "name": "Test Retailer",
        "description": "This is a test retailer for integration testing."
    }

    image_path = os.path.join(os.path.dirname(__file__), "test_image.png")

    with open(image_path, "wb") as f:
        f.write(b"\x89PNG\r\n\x1a\n\x00\x00\x00\rIHDR\x00\x00\x00\x01\x00\x00\x00\x01\x08\x02\x00\x00\x00\x90wS\xde\x00\x00\x00\nIDATx\xdac\xfc\xff\xff?\x00\x05\xfe\x02\xfeA\x0b\x0e\x1b\x00\x00\x00\x00IEND\xaeB`\x82")
    with open(image_path, "rb") as img:
        response = client.post(
            "retailer/register",
            data=form_data,
            files={"banner_image": ("test_image.png", img, "image/png")}
        )
    os.remove(image_path)
    assert response.status_code == 404

def test_register_retailer_invalid_body():
    form_data = {
        "name": "Test Retailer",
        "description": "This is a test retailer for integration testing."
    }

    image_path = os.path.join(os.path.dirname(__file__), "test_image.png")

    with open(image_path, "wb") as f:
        f.write(b"\x89PNG\r\n\x1a\n\x00\x00\x00\rIHDR\x00\x00\x00\x01\x00\x00\x00\x01\x08\x02\x00\x00\x00\x90wS\xde\x00\x00\x00\nIDATx\xdac\xfc\xff\xff?\x00\x05\xfe\x02\xfeA\x0b\x0e\x1b\x00\x00\x00\x00IEND\xaeB`\x82")
    with open(image_path, "rb") as img:
        response = client.post(
            "retailer/register",
            data=form_data,
            files={"banner_image": ("test_image.png", img, "image/png")}
        )
    os.remove(image_path)
    assert response.status_code == 422

    form_data = {
        "user_id": "e1ca2b93-314f-4a71-b6fb-3bb430157b1f",
        "description": "This is a test retailer for integration testing."
    }

    image_path = os.path.join(os.path.dirname(__file__), "test_image.png")

    with open(image_path, "wb") as f:
        f.write(b"\x89PNG\r\n\x1a\n\x00\x00\x00\rIHDR\x00\x00\x00\x01\x00\x00\x00\x01\x08\x02\x00\x00\x00\x90wS\xde\x00\x00\x00\nIDATx\xdac\xfc\xff\xff?\x00\x05\xfe\x02\xfeA\x0b\x0e\x1b\x00\x00\x00\x00IEND\xaeB`\x82")
    with open(image_path, "rb") as img:
        response = client.post(
            "retailer/register",
            data=form_data,
            files={"banner_image": ("test_image.png", img, "image/png")}
        )
    os.remove(image_path)
    assert response.status_code == 422

    form_data = {
        "user_id": "e1ca2b93-314f-4a71-b6fb-3bb430157b1f",
        "name": "Test Retailer"
    }

    image_path = os.path.join(os.path.dirname(__file__), "test_image.png")
    
    with open(image_path, "wb") as f:
        f.write(b"\x89PNG\r\n\x1a\n\x00\x00\x00\rIHDR\x00\x00\x00\x01\x00\x00\x00\x01\x08\x02\x00\x00\x00\x90wS\xde\x00\x00\x00\nIDATx\xdac\xfc\xff\xff?\x00\x05\xfe\x02\xfeA\x0b\x0e\x1b\x00\x00\x00\x00IEND\xaeB`\x82")
    with open(image_path, "rb") as img:
        response = client.post(
            "retailer/register",
            data=form_data,
            files={"banner_image": ("test_image.png", img, "image/png")}
        )
    os.remove(image_path)

def test_set_retailer_information_standard_response():
    form_data = {
        "user_id": "e1ca2b93-314f-4a71-b6fb-3bb430157b1f",
        "name": "Greencart",
        "description": "Greencart is a green e-comerce initiative website"
    }

    image_path = os.path.join(os.path.dirname(__file__), "test_image.png")
    
    with open(image_path, "wb") as f:
        f.write(b"\x89PNG\r\n\x1a\n\x00\x00\x00\rIHDR\x00\x00\x00\x01\x00\x00\x00\x01\x08\x02\x00\x00\x00\x90wS\xde\x00\x00\x00\nIDATx\xdac\xfc\xff\xff?\x00\x05\xfe\x02\xfeA\x0b\x0e\x1b\x00\x00\x00\x00IEND\xaeB`\x82")
    with open(image_path, "rb") as img:
        response = client.patch(
            "retailer/setRetailerInformation",
            data=form_data,
            files={"banner_image": ("test_image.png", img, "image/png")}
        )
    os.remove(image_path)
    assert response.status_code == 200

def test_set_retailer_information_invalid_user_id():
    form_data = {
        "user_id": "invalid-user-id",
        "name": "Greencart",
        "description": "Greencart is a green e-comerce initiative website"
    }

    image_path = os.path.join(os.path.dirname(__file__), "test_image.png")
    
    with open(image_path, "wb") as f:
        f.write(b"\x89PNG\r\n\x1a\n\x00\x00\x00\rIHDR\x00\x00\x00\x01\x00\x00\x00\x01\x08\x02\x00\x00\x00\x90wS\xde\x00\x00\x00\nIDATx\xdac\xfc\xff\xff?\x00\x05\xfe\x02\xfeA\x0b\x0e\x1b\x00\x00\x00\x00IEND\xaeB`\x82")
    with open(image_path, "rb") as img:
        response = client.patch(
            "retailer/setRetailerInformation",
            data=form_data,
            files={"banner_image": ("test_image.png", img, "image/png")}
        )
    os.remove(image_path)
    assert response.status_code == 404

def test_set_retailer_information_invalid_body():
    form_data = {
        "name": "Greencart",
        "description": "Greencart is a green e-comerce initiative website"
    }
    
    image_path = os.path.join(os.path.dirname(__file__), "test_image.png")  
    with open(image_path, "wb") as f:
        f.write(b"\x89PNG\r\n\x1a\n\x00\x00\x00\rIHDR\x00\x00\x00\x01\x00\x00\x00\x01\x08\x02\x00\x00\x00\x90wS\xde\x00\x00\x00\nIDATx\xdac\xfc\xff\xff?\x00\x05\xfe\x02\xfeA\x0b\x0e\x1b\x00\x00\x00\x00IEND\xaeB`\x82")
    with open(image_path, "rb") as img:
        response = client.patch(
            "retailer/setRetailerInformation",
            data=form_data,
            files={"banner_image": ("test_image.png", img, "image/png")}
        )
    os.remove(image_path)
    assert response.status_code == 422

    form_data = {
        "user_id": "e1ca2b93-314f-4a71-b6fb-3bb430157b1f",
        "description": "Greencart is a green e-comerce initiative website"
    }
    
    image_path = os.path.join(os.path.dirname(__file__), "test_image.png")
    
    with open(image_path, "wb") as f:
        f.write(b"\x89PNG\r\n\x1a\n\x00\x00\x00\rIHDR\x00\x00\x00\x01\x00\x00\x00\x01\x08\x02\x00\x00\x00\x90wS\xde\x00\x00\x00\nIDATx\xdac\xfc\xff\xff?\x00\x05\xfe\x02\xfeA\x0b\x0e\x1b\x00\x00\x00\x00IEND\xaeB`\x82")
    with open(image_path, "rb") as img:
        response = client.patch(
            "retailer/setRetailerInformation",
            data=form_data,
            files={"banner_image": ("test_image.png", img, "image/png")}
        )
    os.remove(image_path)
    assert response.status_code == 422

    form_data = {
        "user_id": "e1ca2b93-314f-4a71-b6fb-3bb430157b1f",
        "name": "Greencart"
    }
    
    image_path = os.path.join(os.path.dirname(__file__), "test_image.png")
    
    with open(image_path, "wb") as f:
        f.write(b"\x89PNG\r\n\x1a\n\x00\x00\x00\rIHDR\x00\x00\x00\x01\x00\x00\x00\x01\x08\x02\x00\x00\x00\x90wS\xde\x00\x00\x00\nIDATx\xdac\xfc\xff\xff?\x00\x05\xfe\x02\xfeA\x0b\x0e\x1b\x00\x00\x00\x00IEND\xaeB`\x82")
    with open(image_path, "rb") as img:
        response = client.patch(
            "retailer/setRetailerInformation",
            data=form_data,
            files={"banner_image": ("test_image.png", img, "image/png")}
        )
    os.remove(image_path)
    assert response.status_code == 422  

def test_set_retailer_information_invalid_image():
    form_data = {
        "user_id": "e1ca2b93-314f-4a71-b6fb-3bb430157b1f",
        "name": "Greencart",
        "description": "Greencart is a green e-comerce initiative website"
    }

    image_path = os.path.join(os.path.dirname(__file__), "test_image.txt")
    
    with open(image_path, "w") as f:
        f.write("This is not a valid image file.")
    
    with open(image_path, "rb") as img:
        response = client.patch(
            "retailer/setRetailerInformation",
            data=form_data,
            files={"banner_image": ("test_image.txt", img, "text/plain")}
        )
    os.remove(image_path)
    assert response.status_code != 422  