from enum import Enum


class InteractionType(str, Enum):
    NOTA = "NOTA"
    LLAMADA = "LLAMADA"
    EMAIL = "EMAIL"
    REUNION = "REUNION"