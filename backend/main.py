from fastapi import FastAPI, HTTPException, UploadFile, File, Form, Depends
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
from sqlalchemy.orm import Session
from io import BytesIO
from dotenv import load_dotenv

load_dotenv(override=False)

from db import engine, get_db, get_db_context
from db_ops import add_employees_from_records
from models import Base, Division
from parsers import csv_parser
from routers import employees, divisions, ranks, positions, departments, bands
from utils import seed_db

@asynccontextmanager
async def lifespan(app: FastAPI):
    Base.metadata.create_all(bind=engine) # Create tables
    with get_db_context() as db:
        seed_db(db) # Seed database with primitives

    yield  # Runtime

    # Cleanup

app = FastAPI(lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"], # This may not work for development outside docker-compose
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(employees.router)
app.include_router(divisions.router)
app.include_router(ranks.router)
app.include_router(positions.router)
app.include_router(departments.router)
app.include_router(bands.router)

@app.get("/health")
async def health():
    return {'status': 'ok'}

@app.post("/upload-csv")
async def upload_csv(file: UploadFile = File(...), division_id: int = Form(...), db: Session = Depends(get_db)):
    
    # Check division exists
    division = db.query(Division).filter(Division.id == division_id).first()
    if not division:
        raise HTTPException(404, f"Division {division_id} not found.")
    # Check division schema exists
    division_schema = csv_parser.schemas.get(division_id)
    if not division_schema:
        raise HTTPException(400, f"No schema exists for division {division_id}. Please ensure there is YAML file for this division.")

    contents = await file.read()
    buffer = BytesIO(contents) 

    try:
        records, errors = csv_parser.parse_csv(buffer, division_schema, db)
    except Exception as e:
        print(e)
        raise HTTPException(400, "Failed to parse CSV.")

    success_count, updated_count, errors = add_employees_from_records(records, division_id, db)
    return {"message": f"Created {success_count} employees with division {division_id}.\nUpdated {updated_count} employees with division {division_id}.", "errors": errors} 