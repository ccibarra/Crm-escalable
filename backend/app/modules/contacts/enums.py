from enum import Enum


class ContactStatus(str, Enum):
    NUEVO = "NUEVO"
    CONTACTADO = "CONTACTADO"
    CALIFICADO = "CALIFICADO"
    NO_CALIFICADO = "NO_CALIFICADO"
    CLIENTE = "CLIENTE"