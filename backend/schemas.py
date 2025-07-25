from typing import Optional
from pydantic import BaseModel, Field
from datetime import date, datetime

class CreateDivision(BaseModel):
    id: int = Field(..., ge=1)

class CreateRank(BaseModel):
    name: str = Field(...)

class CreatePosition(BaseModel):
    name: str = Field(...)

class CreateDepartment(BaseModel):
    name: str = Field(...)

class CreateSalaryBand(BaseModel):
    id: int = Field(..., ge=1)

class CreateEmployee(BaseModel):
    first_name: str = Field(..., min_length=1)
    surname: str = Field(..., min_length=1)
    division_id: int = Field(..., ge=1)
    rank_id: int = Field(..., ge=1)
    position_id: int = Field(..., ge=1)
    department_id: int = Field(..., ge=1)
    salary_band_id: int = Field(..., ge=1)
    contact_number: str = Field(..., pattern=r"(\+|0)\d+")
    start_date: date = Field(...)
    last_updated: Optional[datetime] = Field(default=datetime.now())

    model_config = {
        "from_attributes": True
    }
