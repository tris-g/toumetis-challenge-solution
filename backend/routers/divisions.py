from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from db import get_db
from models import Division
from schemas import CreateDivision

router = APIRouter(
    prefix="/divisions",
    tags=["divisions"],
    responses={404: {"description": "Not found"}},
)

@router.get("/")
async def get_divisions(db: Session = Depends(get_db)):
    divisions = db.query(Division).all()
    return divisions

@router.get("/{id}")
async def get_division(id: int, db: Session = Depends(get_db)):
    division = db.query(Division).filter(Division.id == id).first()
    if not division:
        raise HTTPException(status_code=404, detail="Division not found")
    return division

@router.post("/")
async def create_division(division: CreateDivision, db: Session = Depends(get_db)):
    db_division = Division(**division.model_dump())
    db.add(db_division)
    db.commit()
    return division