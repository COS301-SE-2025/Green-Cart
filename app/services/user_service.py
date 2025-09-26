from fastapi import HTTPException
from sqlalchemy.orm import Session
from app.models.user import User
from app.models.address import Address
from app.schemas.user import UserCreate
from app.utilities.utils import hash_password, verify_password
import uuid
from datetime import datetime
import pyotp
import qrcode
import base64
import io

def create_user(db: Session, user: UserCreate):
    new_user = User(
        id=str(uuid.uuid4()),
        name=user.name,
        email=user.email,
        password=hash_password(user.password)
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    return new_user

def get_user_by_email(db: Session, email: str):
    return db.query(User).filter(User.email == email).first()

def get_user_information(db: Session, user_id: str):
    user = db.query(User).filter(User.id == user_id).first()

    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    user_dict = user.__dict__.copy()
    user_dict.pop("password", None)

    address = db.query(Address).filter(Address.user_id == user.id).first()

    return {
        "status": 200,
        "message": "Success",
        "user": user,
        "address": address
    }

def set_user_information(request, db: Session):
    user = db.query(User).filter(User.id == request.user_id).first()
    address = db.query(Address).filter(Address.user_id == request.user_id).first()

    if not user:
        raise HTTPException(status_code=404, detail="User not found : )")

    if not request.name or request.name == "" or request.name == " ":
        raise HTTPException(status_code=400, detail="Name cannot be empty or whitespace")

    if len(request.name.split(" ")) < 2:
        raise HTTPException(status_code=400, detail="Name must contain name and surname")

    if not request.name.replace(" ", "").isalpha():
        raise HTTPException(status_code=400, detail="Name must contain only letters")

    if request.name != user.name:
        user.name = request.name

    if not request.email or request.email.strip() == "":
        raise HTTPException(status_code=400, detail="Email cannot be empty")

    if "@" not in request.email or "." not in request.email.split("@")[-1]:
        raise HTTPException(status_code=400, detail="Invalid email format")

    if request.email != user.email:
        existing_user = db.query(User).filter(User.email == request.email).first()
        if existing_user and existing_user.id != user.id:
            raise HTTPException(status_code=400, detail="Email already in use")
        user.email = request.email

    if not request.date_of_birth:
        raise HTTPException(status_code=400, detail="Date of birth cannot be empty")

    if request.date_of_birth > datetime.now().date():
        raise HTTPException(status_code=400, detail="Date of birth cannot be in the future")

    if request.date_of_birth != user.date_of_birth:
        user.date_of_birth = request.date_of_birth

    if not request.telephone or request.telephone.strip() == "":
        raise HTTPException(status_code=400, detail="Telephone cannot be empty")
    
    if not request.telephone.isdigit():
        raise HTTPException(status_code=400, detail="Telephone must contain only digits")
    
    if len(request.telephone) != 9:
        raise HTTPException(status_code=400, detail="Telephone must be 9 digits long (Exclude country code - 0)")

    if request.telephone != user.telephone:
        user.telephone = request.telephone

    if not request.country_code or request.country_code.strip() == "":
        raise HTTPException(status_code=400, detail="Country code cannot be empty")

    if request.country_code != user.country_code:
        user.country_code = request.country_code

    if not request.address or request.address.strip() == "":
        raise HTTPException(status_code=400, detail="Address cannot be empty")

    if not request.city or request.city.strip() == "":
        raise HTTPException(status_code=400, detail="City cannot be empty")

    if not request.postal_code or request.postal_code.strip() == "":
        raise HTTPException(status_code=400, detail="Postal code cannot be empty")
    
    if not request.postal_code.isdigit():
        raise HTTPException(status_code=400, detail="Postal code must contain only digits")

    if not address:
        address = Address(
            user_id=request.user_id,
            address=request.address,
            city=request.city,
            postal_code=request.postal_code,
        )

        db.add(address)
    else:
        if request.address != address.address:
            address.address = request.address

        if request.city != address.city:
            address.city = request.city
        
        if request.postal_code != address.postal_code:
            address.postal_code = request.postal_code

    db.commit()
    db.refresh(user)
    db.refresh(address)
    return {
        "status": 200,
        "message": "User information updated successfully"
    }

    
def change_password(request, db:Session):
    user = db.query(User).filter(User.id == request.user_id).first()

    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    if verify_password(request.old_password, user.password) is False:
        raise HTTPException(status_code=400, detail="Old password is incorrect")

    user.password = hash_password(request.new_password)
    db.commit()
    db.refresh(user)

    return {
        "status": 200,
        "message": "Password changed successfully"
    }

def mfa_setup(user_id: str, db: Session):
    user = db.query(User).filter(User.id == user_id).first()

    if user.secret is None or user.secret == "":
        secret = pyotp.random_base32()
        uri = pyotp.totp.TOTP(secret).provisioning_uri(name=user.email, issuer_name="GreenCart")
        
        user.secret = secret
        db.commit()
        db.refresh(user)
    else:
        uri = pyotp.totp.TOTP(user.secret).provisioning_uri(name=user.email, issuer_name="GreenCart")

    qr = qrcode.QRCode(box_size=10, border=4)
    qr.add_data(uri)
    qr.make(fit=True)
    img = qr.make_image(fill_color="black", back_color="white")

    buffered = io.BytesIO()
    img.save(buffered, format="PNG")
    qr_base64 = base64.b64encode(buffered.getvalue()).decode("utf-8")

    if not user:
        raise HTTPException(status_code=404, detail="User not found")




    return {
        "status": 200,
        "message": "MFA enabled successfully",
        "qr_code": qr_base64,
        "secret": user.secret
    }

def is_MFA(email, db: Session):
    user = db.query(User).filter(User.email == email).first()

    if user.secret is None or user.secret == "":
        return {
            'status': 200,
            'message': 'Success',
            'enabled': False
        }
    
    else:
        return {
            'status': 200,
            'message': 'Success',
            'enabled': True
        }
    
def disable_MFA(user_id, db:Session):
    user = db.query(User).filter(User.id == user_id).first()

    if user.secret is None or user.secret == "":
        return {
            'status': 200,
            'message': 'Success'
        }
    else:
        if user.secret is not None or user.secret != "":
            user.secret = None
            db.commit()
            db.refresh(user)

            return {
                'status': 200,
                'message': 'Success'
            }

def verify_2fa_code(user_id: str, code: str, db: Session):
    user = db.query(User).filter(User.id == user_id).first()
    if not user or not user.secret:
        raise HTTPException(status_code=404, detail="User or secret not found")

    totp = pyotp.TOTP(user.secret)
    if totp.verify(code):
        return {"status": 200, "message": "2FA code is valid", 'valid': True}
    else:
        raise HTTPException(status_code=401, detail="Invalid 2FA code")
