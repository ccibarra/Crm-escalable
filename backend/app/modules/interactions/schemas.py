from uuid import UUID

from pydantic import BaseModel, ConfigDict

from app.modules.interactions.enums import InteractionType


class InteractionCreateRequest(BaseModel):
    contact_id: UUID
    deal_id: UUID | None = None
    type: InteractionType
    description: str


class InteractionUpdateRequest(BaseModel):
    type: InteractionType | None = None
    description: str | None = None


class InteractionResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    contact_id: UUID
    deal_id: UUID | None
    owner_id: UUID
    type: InteractionType
    description: str