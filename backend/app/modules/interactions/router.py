from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.dependencies import get_current_user
from app.modules.interactions.schemas import (
    InteractionCreateRequest,
    InteractionResponse,
    InteractionUpdateRequest,
)
from app.modules.interactions.service import (
    create_interaction,
    delete_interaction,
    get_interaction_by_id,
    get_interactions,
    update_interaction,
)
from app.modules.users.models import User


router = APIRouter(
    prefix="/api/v1/interactions",
    tags=["Interactions"],
)


@router.post(
    "",
    response_model=InteractionResponse,
    status_code=status.HTTP_201_CREATED,
)
def create(
    data: InteractionCreateRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    try:
        return create_interaction(
            db,
            data,
            current_user,
        )

    except ValueError as error:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=str(error),
        )

    except PermissionError as error:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail=str(error),
        )


@router.get(
    "",
    response_model=list[InteractionResponse],
)
def list_all(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return get_interactions(
        db,
        current_user,
    )


@router.get(
    "/{interaction_id}",
    response_model=InteractionResponse,
)
def get_one(
    interaction_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    interaction = get_interaction_by_id(
        db,
        interaction_id,
        current_user,
    )

    if not interaction:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Interacción no encontrada",
        )

    return interaction


@router.put(
    "/{interaction_id}",
    response_model=InteractionResponse,
)
def update(
    interaction_id: UUID,
    data: InteractionUpdateRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    interaction = get_interaction_by_id(
        db,
        interaction_id,
        current_user,
    )

    if not interaction:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Interacción no encontrada",
        )

    return update_interaction(
        db,
        interaction,
        data,
    )


@router.delete(
    "/{interaction_id}",
    status_code=status.HTTP_204_NO_CONTENT,
)
def delete(
    interaction_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    interaction = get_interaction_by_id(
        db,
        interaction_id,
        current_user,
    )

    if not interaction:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Interacción no encontrada",
        )

    delete_interaction(
        db,
        interaction,
    )

    return None