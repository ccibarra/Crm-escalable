from fastapi import FastAPI

app = FastAPI(
    title="CRM API",
    version="0.1.0",
)


@app.get("/health")
def health():
    return {
        "status": "ok",
        "service": "crm-backend"
    }