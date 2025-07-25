from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from db import get_db
from models import Rank
from schemas import CreateRank

router = APIRouter(
    prefix="/ranks",
    tags=["ranks"],
    responses={404: {"description": "Not found"}},
)

@router.get("/")
async def get_ranks(db: Session = Depends(get_db)):
    ranks = db.query(Rank).all()
    return ranks

@router.get("/{id}")
async def get_rank(id: int, db: Session = Depends(get_db)):
    rank = db.query(Rank).filter(Rank.id == id).first()
    if not rank:
        raise HTTPException(status_code=404, detail="Rank not found")
    return rank

@router.post("/")
async def create_rank(rank: CreateRank, db: Session = Depends(get_db)):
    db_rank = Rank(**rank.model_dump())
    db.add(db_rank)
    db.commit()
    return rank