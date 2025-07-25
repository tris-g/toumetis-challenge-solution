from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from db import get_db
from models import Position
from schemas import CreatePosition

router = APIRouter(
    prefix="/positions",
    tags=["positions"],
    responses={404: {"description": "Not found"}},
)

@router.get("/")
async def get_positions(db: Session = Depends(get_db)):
    positions = db.query(Position).all()
    return positions

@router.get("/{id}")
async def get_position(id: int, db: Session = Depends(get_db)):
    position = db.query(Position).filter(Position.id == id).first()
    if not position:
        raise HTTPException(status_code=404, detail="Position not found")
    return position

@router.post("/")
async def create_position(position: CreatePosition, db: Session = Depends(get_db)):
    db_position = Position(**position.model_dump())
    db.add(db_position)
    db.commit()
    return position