from uuid import UUID

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.modules.contacts.models import Contact
from app.modules.deals.models import Deal
from app.modules.interactions.models import Interaction
from app.modules.interactions.schemas import (
    InteractionCreateRequest,
    InteractionUpdateRequest,
)
from app.modules.users.enums import UserRole
from app.modules.users.models import User


def create_interaction(
    db: Session,
    data: InteractionCreateRequest,
    current_user: User,
) -> Interaction:

    contact = db.get(Contact, data.contact_id)

    if not contact:
        raise ValueError("El contacto no existe")

    # VENTAS solo puede registrar interacciones
    # sobre sus propios contactos.
    if (
        current_user.role != UserRole.ADMIN
        and contact.owner_id != current_user.id
    ):
        raise PermissionError(
            "No tienes permisos sobre este contacto"
        )

    # Si se especifica un Deal, verificamos que exista
    # y que pertenezca al mismo contacto.
    if data.deal_id is not None:

        deal = db.get(Deal, data.deal_id)

        if not deal:
            raise ValueError("La oportunidad no existe")

        if deal.contact_id != data.contact_id:
            raise ValueError(
                "La oportunidad no pertenece al contacto"
            )

        # VENTAS solo puede trabajar con sus propios Deals.
        if (
            current_user.role != UserRole.ADMIN
            and deal.owner_id != current_user.id
        ):
            raise PermissionError(
                "No tienes permisos sobre esta oportunidad"
            )

    interaction = Interaction(
        contact_id=data.contact_id,
        deal_id=data.deal_id,
        owner_id=current_user.id,
        type=data.type,
        description=data.description,
    )

    db.add(interaction)
    db.commit()
    db.refresh(interaction)

    return interaction


def get_interactions(
    db: Session,
    current_user: User,
) -> list[Interaction]:

    query = select(Interaction)

    if current_user.role != UserRole.ADMIN:
        query = query.where(
            Interaction.owner_id == current_user.id
        )

    query = query.order_by(
        Interaction.created_at.desc()
    )

    return list(db.scalars(query).all())


def get_interaction_by_id(
    db: Session,
    interaction_id: UUID,
    current_user: User,
) -> Interaction | None:

    query = select(Interaction).where(
        Interaction.id == interaction_id
    )

    if current_user.role != UserRole.ADMIN:
        query = query.where(
            Interaction.owner_id == current_user.id
        )

    return db.scalar(query)


def update_interaction(
    db: Session,
    interaction: Interaction,
    data: InteractionUpdateRequest,
) -> Interaction:

    if data.type is not None:
        interaction.type = data.type

    if data.description is not None:
        interaction.description = data.description

    db.commit()
    db.refresh(interaction)

    return interaction


def delete_interaction(
    db: Session,
    interaction: Interaction,
) -> None:

    db.delete(interaction)
    db.commit()