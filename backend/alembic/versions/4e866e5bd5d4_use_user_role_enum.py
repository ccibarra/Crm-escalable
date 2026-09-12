"""use user role enum

Revision ID: 4e866e5bd5d4
Revises: 471afb78e0bb
Create Date: 2026-09-12 16:38:53.527697
"""

from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = "4e866e5bd5d4"
down_revision: Union[str, Sequence[str], None] = "471afb78e0bb"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


user_role_enum = sa.Enum(
    "ADMIN",
    "VENTAS",
    name="userrole",
)


def upgrade() -> None:
    # Crear el tipo ENUM en PostgreSQL
    user_role_enum.create(op.get_bind(), checkfirst=True)

    # Convertir VARCHAR -> ENUM
    op.alter_column(
        "users",
        "role",
        existing_type=sa.VARCHAR(length=20),
        type_=user_role_enum,
        existing_nullable=False,
        postgresql_using="role::userrole",
    )


def downgrade() -> None:
    # Convertir ENUM -> VARCHAR
    op.alter_column(
        "users",
        "role",
        existing_type=user_role_enum,
        type_=sa.VARCHAR(length=20),
        existing_nullable=False,
    )

    # Eliminar el tipo ENUM
    user_role_enum.drop(op.get_bind(), checkfirst=True)