import os, yaml
from collections import defaultdict
from sqlalchemy.orm import Session

from models import Division, Rank, Position, Department, SalaryBand

def get_config() -> dict:
    """Fetch YAML config file defined at `CONFIG_PATH`."""
    config_path = os.getenv("CONFIG_PATH")
    with open(config_path, "r") as f:
        config: dict[str, list] = yaml.safe_load(f)
    return config

def seed_db(db: Session, config: dict = get_config()):
    """Seed database with data defined in YAML config file."""
    model_map = {
        Division: config.get("divisions", []),
        Rank: config.get("ranks", []),
        Position: config.get("positions", []),
        Department: config.get("departments", []),
        SalaryBand: config.get("salary_bands", []),
    }
    for model, values in model_map.items():
         for value in values:
                if issubclass(model, (Division, SalaryBand)):
                    exists = db.query(model).filter_by(id=value).first()
                else:
                    exists = db.query(model).filter_by(name=value).first()
                
                if not exists:
                    if issubclass(model, (Division, SalaryBand)):
                        db.add(model(id=value))
                    else:
                        db.add(model(name=value))
    db.commit()

def clean_contact_number(contact_number: str) -> str:
    """Sanitise contact number string."""
    sanitised_contact_number = contact_number.strip().replace(" ", "").replace("-", "")
    return sanitised_contact_number

def summarize_errors(errors: list[dict], max_samples=5):
    """Group errors by field and error message. Mainly for use on ValidationErrors returned by Pydantic."""
    grouped = defaultdict(lambda: {"count": 0, "sample_rows": []})

    for err in errors:
        key = (err["field"], err["error"])
        group = grouped[key]
        group["count"] += 1
        if len(group["sample_rows"]) < max_samples:
            group["sample_rows"].append(err["row"])

    return [
        {
            "field": field,
            "error": message,
            "count": info["count"],
            "sample_rows": info["sample_rows"]
        }
        for (field, message), info in grouped.items()
    ]