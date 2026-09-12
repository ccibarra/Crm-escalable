from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.dependencies import get_current_user
from app.modules.contacts.schemas import (
    ContactCreateRequest,
    ContactResponse,
    ContactUpdateRequest,
)
from app.modules.contacts.service import (
    create_contact,
    delete_contact,
    get_contact_by_id,
    get_contacts,
    update_contact,
)
from app.modules.users.models import User


router = APIRouter(
    prefix="/api/v1/contacts",
    tags=["Contacts"],
)


@router.post(
    "",
    response_model=ContactResponse,
    status_code=status.HTTP_201_CREATED,
)
def create(
    data: ContactCreateRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return create_contact(
        db,
        data,
        current_user,
    )


@router.get(
    "",
    response_model=list[ContactResponse],
)
def list_all(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return get_contacts(
        db,
        current_user,
    )


@router.get(
    "/{contact_id}",
    response_model=ContactResponse,
)
def get_one(
    contact_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    contact = get_contact_by_id(
        db,
        contact_id,
        current_user,
    )

    if not contact:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Contacto no encontrado",
        )

    return contact


@router.put(
    "/{contact_id}",
    response_model=ContactResponse,
)
def update(
    contact_id: UUID,
    data: ContactUpdateRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    contact = get_contact_by_id(
        db,
        contact_id,
        current_user,
    )

    if not contact:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Contacto no encontrado",
        )

    return update_contact(
        db,
        contact,
        data,
    )


@router.delete(
    "/{contact_id}",
    status_code=status.HTTP_204_NO_CONTENT,
)
def delete(
    contact_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    contact = get_contact_by_id(
        db,
        contact_id,
        current_user,
    )

    if not contact:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Contacto no encontrado",
        )

    delete_contact(
        db,
        contact,
    )

    return None