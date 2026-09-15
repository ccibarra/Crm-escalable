from uuid import UUID

from pydantic import BaseModel, ConfigDict

from app.modules.deals.enums import DealStage


class DealCreateRequest(BaseModel):
    contact_id: UUID
    title: str
    description: str | None = None
    stage: DealStage = DealStage.PROSPECTO


class DealUpdateRequest(BaseModel):
    title: str | None = None
    description: str | None = None
    stage: DealStage | None = None


class DealResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    contact_id: UUID
    owner_id: UUID
    title: str
    description: str | None
    stage: DealStage