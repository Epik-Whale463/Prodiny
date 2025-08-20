from fastapi import FastAPI, HTTPException, Depends, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from pydantic import BaseModel, EmailStr
from passlib.context import CryptContext
from jose import JWTError, jwt
from datetime import datetime, timedelta
import sqlite3
import os
import json
from typing import Optional, List, Dict
import asyncio

# Initialize FastAPI app
app = FastAPI(
    title="Prodiny API", 
    version="1.0.0",
    description="Professional college collaboration platform API"
)

# Production-ready CORS configuration
allowed_origins = [
    "http://localhost:3000",  # Development
    "https://prodiny-frontend.onrender.com",  # Production frontend
    os.getenv("CORS_ORIGINS", "").split(",") if os.getenv("CORS_ORIGINS") else []
]

# Flatten the list and remove empty strings
allowed_origins = [origin.strip() for sublist in allowed_origins for origin in (sublist if isinstance(sublist, list) else [sublist]) if origin.strip()]

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allow_headers=["*"],
)

# Security configuration
SECRET_KEY = os.getenv("JWT_SECRET_KEY", "your-secret-key-change-this-in-production")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30

# Health check endpoint for Render
@app.get("/health")
async def health_check():
    """Health check endpoint for deployment monitoring"""
    return {
        "status": "healthy",
        "timestamp": datetime.now().isoformat(),
        "version": "1.0.0"
    }

# Root endpoint
@app.get("/")
async def root():
    """API root endpoint"""
    return {
        "message": "Prodiny API is running",
        "docs_url": "/docs",
        "health_url": "/health"
    }
