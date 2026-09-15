from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.modules.auth.router import router as auth_router
from app.modules.users.router import router as users_router
from app.modules.contacts.router import router as contacts_router
from app.modules.deals.router import router as deals_router
from app.modules.interactions.router import router as interactions_router


app = FastAPI(
    title="CRM API",
    version="0.1.0",
)


app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


app.include_router(auth_router)
app.include_router(users_router)
app.include_router(contacts_router)
app.include_router(deals_router)
app.include_router(interactions_router)


@app.get("/health")
def health():
    return {
        "status": "ok",
        "service": "crm-backend",
    }