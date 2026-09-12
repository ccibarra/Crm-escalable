from uuid import UUID

from pydantic import BaseModel, ConfigDict, EmailStr

from app.modules.users.enums import UserRole


class RegisterRequest(BaseModel):
    nombre: str
    apellido: str
    email: EmailStr
    password: str


class LoginRequest(BaseModel):
    email: EmailStr
    password: str


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"


class UserResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    nombre: str
    apellido: str
    email: EmailStr
    role: UserRole
    is_active: bool