from uuid import UUID

from pydantic import BaseModel, ConfigDict, EmailStr

from app.modules.contacts.enums import ContactStatus


class ContactCreateRequest(BaseModel):
    nombre: str
    email: EmailStr | None = None
    telefono: str | None = None
    empresa: str | None = None
    status: ContactStatus = ContactStatus.NUEVO


class ContactUpdateRequest(BaseModel):
    nombre: str | None = None
    email: EmailStr | None = None
    telefono: str | None = None
    empresa: str | None = None
    status: ContactStatus | None = None


class ContactResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    nombre: str
    email: EmailStr | None
    telefono: str | None
    empresa: str | None
    status: ContactStatus
    owner_id: UUID