from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.db.session import engine
from app.models import all_models as models
from app.api.v1 import (
    auth, properties, bookings, payments, reports, 
    audit, notifications
)

# Create tables
models.Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="Sleeping Bear Rental API",
    description="API for condominium rental management system",
    version="1.0.0"
)

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Configure properly in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers from the new v1 folder
app.include_router(auth.router)
app.include_router(properties.router)
app.include_router(bookings.router)
app.include_router(payments.router)
app.include_router(reports.router)
app.include_router(audit.router)
app.include_router(notifications.router)

@app.get("/")
def read_root():
    return {
        "message": "Sleeping Bear Rental API",
        "version": "1.0.0",
        "status": "running",
        "docs": "/docs"
    }

@app.get("/health")
def health_check():
    return {"status": "healthy"}