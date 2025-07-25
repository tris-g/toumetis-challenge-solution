from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from db import get_db
from models import Department
from schemas import CreateDepartment

router = APIRouter(
    prefix="/departments",
    tags=["departments"],
    responses={404: {"description": "Not found"}},
)

@router.get("/")
async def get_departments(db: Session = Depends(get_db)):
    departments = db.query(Department).all()
    return departments

@router.get("/{id}")
async def get_department(id: int, db: Session = Depends(get_db)):
    department = db.query(Department).filter(Department.id == id).first()
    if not department:
        raise HTTPException(status_code=404, detail="Department not found")
    return department

@router.post("/")
async def create_department(department: CreateDepartment, db: Session = Depends(get_db)):
    db_department = Department(**department.model_dump())
    db.add(db_department)
    db.commit()
    return department