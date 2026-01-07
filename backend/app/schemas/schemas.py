# app/schemas/schemas.py

from pydantic import BaseModel, EmailStr, Field, validator
from typing import Optional, Any
from datetime import datetime
import re
import html

# --- Helper Functions for Data Sanitization ---

def sanitize_string(value: str, max_length: int = 255) -> str:
    """Sanitize string input by escaping HTML and stripping whitespace."""
    if not value:
        return value
    # Strip leading/trailing whitespace
    value = value.strip()
    # Escape HTML special characters to prevent XSS
    value = html.escape(value)
    # Truncate to max length
    return value[:max_length]

def validate_name(value: str, field_name: str) -> str:
    """Validate name fields contain only letters, spaces, and common characters."""
    if not value:
        return value
    value = sanitize_string(value, max_length=100)
    # Allow letters (including Unicode), spaces, hyphens, apostrophes, and periods
    if not re.match(r"^[\w\s\-'.]+$", value, re.UNICODE):
        raise ValueError(f"{field_name} contains invalid characters")
    return value

def validate_phone(value: str) -> str:
    """Validate phone number format."""
    if not value:
        return value
    # Remove common formatting characters
    cleaned = re.sub(r'[\s\-\(\)\+]', '', value)
    # Should be 10-15 digits
    if not re.match(r'^\d{10,15}$', cleaned):
        raise ValueError("Phone must be 10-15 digits")
    return cleaned

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
    password: str = Field(min_length=6, max_length=128)
    
    # Validators for proper encoding
    @validator('full_name', pre=True, always=True)
    def validate_full_name(cls, v):
        if v:
            return validate_name(v, "Full name")
        return v
    
    @validator('username', pre=True, always=True)
    def validate_username(cls, v):
        if v:
            v = sanitize_string(v, max_length=50)
            if not re.match(r'^[\w\-_.]+$', v):
                raise ValueError("Username can only contain letters, numbers, underscores, hyphens, and periods")
        return v
    
    @validator('phone', pre=True, always=True)
    def validate_phone_number(cls, v):
        if v:
            return validate_phone(v)
        return v
    
    @validator('role', pre=True, always=True)
    def validate_role(cls, v):
        allowed_roles = ['tenant', 'owner', 'admin']
        if v and v.lower() not in allowed_roles:
            raise ValueError(f"Role must be one of: {', '.join(allowed_roles)}")
        return v.lower() if v else 'tenant'
    
    # We might add these if we want strict separation, but combining to full_name is common:
    # first_name: str
    # last_name: str
    # middle_name: Optional[str] = None


# --- 2. Login Schemas (Maps to Wireframe Page 3) ---

class UserLogin(BaseModel):
    """Schema for user login request."""
    # Wireframe Page 3 fields: EMAIL ADDRESS, PASSWORD
    email: str
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