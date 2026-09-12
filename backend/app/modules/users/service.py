from uuid import UUID

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.modules.users.enums import UserRole
from app.modules.users.models import User


def get_users(db: Session) -> list[User]:
    return list(
        db.scalars(
            select(User).order_by(User.created_at.desc())
        ).all()
    )


def get_user_by_id(
    db: Session,
    user_id: UUID,
) -> User | None:

    return db.get(User, user_id)


def update_user(
    db: Session,
    user: User,
    nombre: str | None,
    apellido: str | None,
    email: str | None,
) -> User:

    if nombre is not None:
        user.nombre = nombre

    if apellido is not None:
        user.apellido = apellido

    if email is not None:
        existing_user = db.scalar(
            select(User).where(
                User.email == email,
                User.id != user.id,
            )
        )

        if existing_user:
            raise ValueError("El email ya está registrado")

        user.email = email

    db.commit()
    db.refresh(user)

    return user


def update_user_role(
    db: Session,
    user: User,
    role: UserRole,
) -> User:

    user.role = role

    db.commit()
    db.refresh(user)

    return user


def update_user_status(
    db: Session,
    user: User,
    is_active: bool,
) -> User:

    user.is_active = is_active

    db.commit()
    db.refresh(user)

    return user