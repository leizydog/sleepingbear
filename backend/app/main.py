from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles  # Import StaticFiles
import os
from app.db.session import engine
from app.models import all_models as models
from app.api.v1 import (
    auth, properties, bookings, payments, reports, 
    audit, notifications, ml_predictions  
)

# Create tables
models.Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="Sleeping Bear Rental API",
    description="API for condominium rental management system",
    version="1.0.0"
)

# --- NEW: Create static directory for images ---
os.makedirs("static/uploads", exist_ok=True)
# Mount the static directory to serve images at /static
app.mount("/static", StaticFiles(directory="static"), name="static")

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], 
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(auth.router)
app.include_router(properties.router)
app.include_router(bookings.router)
app.include_router(payments.router)
app.include_router(reports.router)
app.include_router(audit.router)
app.include_router(notifications.router)
app.include_router(ml_predictions.router)  # ← ADD THIS

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