from uuid import UUID

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.modules.contacts.models import Contact
from app.modules.deals.models import Deal
from app.modules.deals.schemas import (
    DealCreateRequest,
    DealUpdateRequest,
)
from app.modules.users.enums import UserRole
from app.modules.users.models import User


def create_deal(
    db: Session,
    data: DealCreateRequest,
    current_user: User,
) -> Deal:

    contact = db.get(Contact, data.contact_id)

    if not contact:
        raise ValueError("El contacto no existe")

    # VENTAS solo puede crear oportunidades
    # sobre sus propios contactos.
    if (
        current_user.role != UserRole.ADMIN
        and contact.owner_id != current_user.id
    ):
        raise PermissionError(
            "No tienes permisos sobre este contacto"
        )

    deal = Deal(
        contact_id=data.contact_id,
        owner_id=current_user.id,
        title=data.title,
        description=data.description,
        stage=data.stage,
    )

    db.add(deal)
    db.commit()
    db.refresh(deal)

    return deal


def get_deals(
    db: Session,
    current_user: User,
) -> list[Deal]:

    query = select(Deal)

    if current_user.role != UserRole.ADMIN:
        query = query.where(
            Deal.owner_id == current_user.id
        )

    query = query.order_by(
        Deal.created_at.desc()
    )

    return list(db.scalars(query).all())


def get_deal_by_id(
    db: Session,
    deal_id: UUID,
    current_user: User,
) -> Deal | None:

    query = select(Deal).where(
        Deal.id == deal_id
    )

    if current_user.role != UserRole.ADMIN:
        query = query.where(
            Deal.owner_id == current_user.id
        )

    return db.scalar(query)


def update_deal(
    db: Session,
    deal: Deal,
    data: DealUpdateRequest,
) -> Deal:

    if data.title is not None:
        deal.title = data.title

    if data.description is not None:
        deal.description = data.description

    if data.stage is not None:
        deal.stage = data.stage

    db.commit()
    db.refresh(deal)

    return deal


def delete_deal(
    db: Session,
    deal: Deal,
) -> None:

    db.delete(deal)
    db.commit()