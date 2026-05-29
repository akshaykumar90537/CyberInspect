from pydantic import BaseModel, EmailStr, field_validator
import re

class RegisterRequest(BaseModel):
    email: EmailStr
    full_name: str
    password: str

    @field_validator("password")
    @classmethod
    def strong_password(cls, v: str) -> str:
        if len(v) < 8:
            raise ValueError("Password must be at least 8 characters")
        return v

class LoginRequest(BaseModel):
    email: EmailStr
    password: str

class TokenResponse(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str = "bearer"

class UserResponse(BaseModel):
    id: str
    email: str
    full_name: str | None
    role: str
    avatar_url: str | None
    is_verified: bool
    model_config = {"from_attributes": True}
