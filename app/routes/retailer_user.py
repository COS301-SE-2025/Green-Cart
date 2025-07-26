from fastapi import APIRouter, Depends, Form, UploadFile, File
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.schemas.retailer import RegisterAsRetailerRequest, RegisterAsRetailerResponse, SetRetailerInformationRequest, SetRetailerInformationResponse
from app.services.retailer_user_service import register_as_retailer,set_retailer_information
import os

router = APIRouter(prefix="/retailer", tags=["Retailer"])

@router.post("/register", response_model=RegisterAsRetailerResponse)
async def register_retailer(
    user_id: str = Form(...),
    name: str = Form(...),
    description: str = Form(...),
    banner_image: UploadFile = File(...),
    db: Session = Depends(get_db)
):
    upload_dir = "app/assets/"+user_id
    os.makedirs(upload_dir, exist_ok=True)
    original_extension = os.path.splitext(banner_image.filename)[1]
    newName = f"banner{original_extension}"
    file_location = f"{upload_dir}/{newName}"

    with open(file_location, "wb") as file:
        file.write(await banner_image.read())

    request = type("obj", (object,), {})()
    request.user_id = user_id
    request.name = name
    request.description = description
    request.banner_image = file_location

    response = register_as_retailer(request, db)
    return response

@router.patch("/setRetailerInformation", response_model=SetRetailerInformationResponse)
async def update_retailer_information(
    user_id: str = Form(...),
    name: str = Form(...),
    description: str = Form(...),
    banner_image: UploadFile = File(...),
    db: Session = Depends(get_db)
):
    upload_dir = "app/assets/"+user_id
    os.makedirs(upload_dir, exist_ok=True)
    original_extension = os.path.splitext(banner_image.filename)[1]
    newName = f"banner{original_extension}"
    file_location = f"{upload_dir}/{newName}"

    with open(file_location, "wb") as file:
        file.write(await banner_image.read())

    request = SetRetailerInformationRequest(
        user_id=user_id,
        name=name,
        description=description,
        banner_image=file_location
    )
    response = set_retailer_information(request, db)
    return response