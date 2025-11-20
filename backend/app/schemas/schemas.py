# app/schemas/schemas.py

from pydantic import BaseModel, EmailStr, Field
from typing import Optional, Any
from datetime import datetime

# --- Base User Schemas ---

class UserBase(BaseModel):
    """Base fields shared by other user schemas."""
    email: EmailStr
    full_name: Optional[str] = None
    phone: Optional[str] = None
    role: str = Field(default="tenant", description="User role: 'tenant', 'owner', or 'admin'")
    # Note: 'username' is used in auth.py, but not on the wireframe. 
    # We include it here for compatibility with the backend logic.
    username: Optional[str] = None 

# --- 1. Registration Schemas (Maps to Wireframe Page 2) ---

class UserCreate(UserBase):
    """Schema for user registration request."""
    # Wireframe Page 2 fields:
    # FIRST NAME, MIDDLE NAME (OPTIONAL), LAST NAME are handled by the single full_name field 
    # EMAIL ADDRESS, CONTACT NUMBER (phone), PASSWORD
    password: str = Field(min_length=6)
    
    # We might add these if we want strict separation, but combining to full_name is common:
    # first_name: str
    # last_name: str
    # middle_name: Optional[str] = None


# --- 2. Login Schemas (Maps to Wireframe Page 3) ---

class UserLogin(BaseModel):
    """Schema for user login request."""
    # Wireframe Page 3 fields: EMAIL ADDRESS, PASSWORD
    email: EmailStr
    password: str


# --- 3. Response and Update Schemas ---

class UserResponse(UserBase):
    """Schema for returning user data (without password hash)."""
    id: Any
    is_active: bool
    created_at: datetime
    
    class Config:
        # Allows ORM models to be converted directly to this schema
        from_attributes = True

class UserUpdate(BaseModel):
    """Schema for updating user profile (/auth/me PUT request)."""
    full_name: Optional[str] = None
    phone: Optional[str] = None

class PasswordReset(BaseModel):
    """Schema for changing a password (/auth/change-password POST request)."""
    old_password: str
    new_password: str = Field(min_length=6)


# --- 4. Token Schemas (Returned on Register and Login) ---

class Token(BaseModel):
    """Schema for token response (used by /auth/register and /auth/login)."""
    access_token: str
    token_type: str
    user: UserResponse # Embed the full user object

class TokenData(BaseModel):
    """Schema for data stored within the JWT token."""
    sub: Optional[str] = None # User ID