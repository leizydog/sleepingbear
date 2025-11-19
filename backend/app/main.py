from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from database import engine
import models
from routers import (auth, properties, bookings, payments, reports, audit
                     , notifications)
app = FastAPI()
app.include_router(audit.router)
app.include_router(notifications.router)


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

# Include routers
app.include_router(auth.router)
app.include_router(properties.router)
app.include_router(bookings.router)
app.include_router(payments.router)
app.include_router(reports.router)

@app.get("/")
def read_root():
    return {
        "message": "Sleeping Bear Rental API",
        "version": "1.0.0",
        "status": "running",
        "endpoints": {
            "auth": "/auth",
            "properties": "/properties",
            "bookings": "/bookings",
            "docs": "/docs"
        }
    }

@app.get("/health")
def health_check():
    return {"status": "healthy"}