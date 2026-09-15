from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.dependencies import get_current_user
from app.modules.deals.schemas import (
    DealCreateRequest,
    DealResponse,
    DealUpdateRequest,
)
from app.modules.deals.service import (
    create_deal,
    delete_deal,
    get_deal_by_id,
    get_deals,
    update_deal,
)
from app.modules.users.models import User


router = APIRouter(
    prefix="/api/v1/deals",
    tags=["Deals"],
)


@router.post(
    "",
    response_model=DealResponse,
    status_code=status.HTTP_201_CREATED,
)
def create(
    data: DealCreateRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    try:
        return create_deal(
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
    response_model=list[DealResponse],
)
def list_all(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return get_deals(
        db,
        current_user,
    )


@router.get(
    "/{deal_id}",
    response_model=DealResponse,
)
def get_one(
    deal_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    deal = get_deal_by_id(
        db,
        deal_id,
        current_user,
    )

    if not deal:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Oportunidad no encontrada",
        )

    return deal


@router.put(
    "/{deal_id}",
    response_model=DealResponse,
)
def update(
    deal_id: UUID,
    data: DealUpdateRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    deal = get_deal_by_id(
        db,
        deal_id,
        current_user,
    )

    if not deal:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Oportunidad no encontrada",
        )

    return update_deal(
        db,
        deal,
        data,
    )


@router.delete(
    "/{deal_id}",
    status_code=status.HTTP_204_NO_CONTENT,
)
def delete(
    deal_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    deal = get_deal_by_id(
        db,
        deal_id,
        current_user,
    )

    if not deal:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Oportunidad no encontrada",
        )

    delete_deal(
        db,
        deal,
    )

    return None