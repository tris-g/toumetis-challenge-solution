from sqlalchemy.orm import Session
from pydantic import ValidationError
from datetime import datetime
from models import Employee
from schemas import CreateEmployee
from utils import summarize_errors

def resolve_fk(model_class, name: str, db: Session):
    "Resolve foreign key from name. Raises ValueError if not found."
    instance = db.query(model_class).filter_by(name=name).first()
    if not instance:
        raise ValueError(f"{model_class.__name__} '{name}' not found in DB")
    return instance.id

def add_employees_from_records(records: list[dict], division_id: int, db: Session, dt: datetime = datetime.now()) -> tuple[int, int, list[dict]]:
    """
    Add employees from records.
    
    # Parameters
    records :list[dict]
        Employee records.
    division_id :int
        Division ID.
    db :Session
        Database session.
    dt :datetime
        Datetime of CSV file ingestion. Defaults to current datetime.

    # Returns
    created_count : int
        Number of employees created.
    updated_count : int
        Number of employees updated.
    errors : list[dict]
        List of errors.
    """
    objects = []
    errors = []
    created_count = 0
    updated_count = 0

    for idx, record in enumerate(records):
        try:
            employee = CreateEmployee(**record, division_id=division_id, last_updated=dt)
            data = employee.model_dump()
            existing = db.query(Employee).filter_by(
                first_name=employee.first_name,
                surname=employee.surname
            ).first()
            
            if existing:
                if existing.last_updated <= employee.last_updated:
                    updated = any(getattr(existing, field) != value for field, value in data.items() if field != "last_updated")
                    if updated:
                        for field, value in data.items():
                            setattr(existing, field, value)
                        updated_count += 1
            else:
                new_employee = Employee(**data)
                objects.append(new_employee)
                created_count += 1

        except ValidationError as ve:
            errors.extend([{"row": idx,"field": err["loc"][0],"error": err["msg"],"type": err["type"]} for err in ve.errors()])

    if objects:
        db.add_all(objects)

    db.commit()
    return created_count, updated_count, summarize_errors(errors)