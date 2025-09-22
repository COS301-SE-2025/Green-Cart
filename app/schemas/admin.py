from pydantic import BaseModel, EmailStr


class AdminLogin(BaseModel):
    email: EmailStr
    password: str


class AdminLoginResponse(BaseModel):
    status: int
    message: str
    user_id: str
    name: str | None = None
    email: EmailStr
    role: str
