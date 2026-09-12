from uuid import UUID

from pydantic import BaseModel, ConfigDict, EmailStr

from app.modules.users.enums import UserRole


class UserResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    nombre: str
    apellido: str
    email: EmailStr
    role: UserRole
    is_active: bool


class UserUpdateRequest(BaseModel):
    nombre: str | None = None
    apellido: str | None = None
    email: EmailStr | None = None


class UserRoleUpdateRequest(BaseModel):
    role: UserRole


class UserStatusUpdateRequest(BaseModel):
    is_active: bool