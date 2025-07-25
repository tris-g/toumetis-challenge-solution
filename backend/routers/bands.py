from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from db import get_db
from models import SalaryBand
from schemas import CreateSalaryBand

router = APIRouter(
    prefix="/bands",
    tags=["bands"],
    responses={404: {"description": "Not found"}},
)

@router.get("/")
async def get_bands(db: Session = Depends(get_db)):
    bands = db.query(SalaryBand).all()
    return bands

@router.get("/{id}")
async def get_band(id: int, db: Session = Depends(get_db)):
    band = db.query(SalaryBand).filter(SalaryBand.id == id).first()
    if not band:
        raise HTTPException(status_code=404, detail="Band not found")
    return band

@router.post("/")
async def create_band(band: CreateSalaryBand, db: Session = Depends(get_db)):
    db_band = CreateSalaryBand(**band.model_dump())
    db.add(db_band)
    db.commit()
    return band