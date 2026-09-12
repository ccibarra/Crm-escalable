from sqlalchemy import select
from sqlalchemy.orm import Session

from app.core.security import (
    create_access_token,
    hash_password,
    verify_password,
)
from app.modules.auth.schemas import RegisterRequest
from app.modules.users.enums import UserRole
from app.modules.users.models import User


def register_user(
    db: Session,
    data: RegisterRequest,
) -> User:

    existing_user = db.scalar(
        select(User).where(User.email == data.email)
    )

    if existing_user:
        raise ValueError("El email ya está registrado")

    user = User(
        nombre=data.nombre,
        apellido=data.apellido,
        email=data.email,
        password_hash=hash_password(data.password),
        role=UserRole.VENTAS,
    )

    db.add(user)
    db.commit()
    db.refresh(user)

    return user


def authenticate_user(
    db: Session,
    email: str,
    password: str,
) -> User | None:

    user = db.scalar(
        select(User).where(User.email == email)
    )

    if not user:
        return None

    if not verify_password(
        password,
        user.password_hash,
    ):
        return None

    return user


def generate_token(user: User) -> str:
    return create_access_token(
        user_id=user.id,
        role=user.role.value,
    )