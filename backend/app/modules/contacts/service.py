from uuid import UUID

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.modules.contacts.models import Contact
from app.modules.contacts.schemas import (
    ContactCreateRequest,
    ContactUpdateRequest,
)
from app.modules.users.enums import UserRole
from app.modules.users.models import User


def create_contact(
    db: Session,
    data: ContactCreateRequest,
    current_user: User,
) -> Contact:

    contact = Contact(
        nombre=data.nombre,
        email=data.email,
        telefono=data.telefono,
        empresa=data.empresa,
        status=data.status,
        owner_id=current_user.id,
    )

    db.add(contact)
    db.commit()
    db.refresh(contact)

    return contact


def get_contacts(
    db: Session,
    current_user: User,
) -> list[Contact]:

    query = select(Contact)

    if current_user.role != UserRole.ADMIN:
        query = query.where(
            Contact.owner_id == current_user.id
        )

    query = query.order_by(
        Contact.created_at.desc()
    )

    return list(db.scalars(query).all())


def get_contact_by_id(
    db: Session,
    contact_id: UUID,
    current_user: User,
) -> Contact | None:

    query = select(Contact).where(
        Contact.id == contact_id
    )

    if current_user.role != UserRole.ADMIN:
        query = query.where(
            Contact.owner_id == current_user.id
        )

    return db.scalar(query)


def update_contact(
    db: Session,
    contact: Contact,
    data: ContactUpdateRequest,
) -> Contact:

    if data.nombre is not None:
        contact.nombre = data.nombre

    if data.email is not None:
        contact.email = data.email

    if data.telefono is not None:
        contact.telefono = data.telefono

    if data.empresa is not None:
        contact.empresa = data.empresa

    if data.status is not None:
        contact.status = data.status

    db.commit()
    db.refresh(contact)

    return contact


def delete_contact(
    db: Session,
    contact: Contact,
) -> None:

    db.delete(contact)
    db.commit()