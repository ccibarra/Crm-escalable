from fastapi import FastAPI

from app.modules.auth.router import router as auth_router


app = FastAPI(
    title="CRM API",
    version="0.1.0",
)


app.include_router(auth_router)


@app.get("/health")
def health():
    return {
        "status": "ok",
        "service": "crm-backend",
    }