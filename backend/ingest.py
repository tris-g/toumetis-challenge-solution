from pathlib import Path
from dotenv import load_dotenv
from re import search, Match
from datetime import datetime

load_dotenv(override=False)

from db import engine, get_db_context
from db_ops import add_employees_from_records
from models import Base
from utils import seed_db
from parsers import csv_parser

def get_date_from_path(path: Path) -> datetime | None:
    """Returns the datetime from the filename if it matches the regex '_(\\d{8})\\.csv$', otherwise None."""
    match = search(r'_(\d{8})\.csv$', path.name)
    if not isinstance(match, Match):
        return None
    else:
        return datetime.strptime(match.group(1), "%Y%m%d")

if __name__ == "__main__":
    import argparse

    parser = argparse.ArgumentParser()
    parser.add_argument("directory", type=Path)
    args = parser.parse_args()

    root_dir: Path = args.directory
    division_dirs = filter(lambda dir: dir.is_dir() and "division" in dir.name.lower(), root_dir.iterdir())
    
    employees = []

    Base.metadata.create_all(bind=engine) # Create tables
    with get_db_context() as db:
        seed_db(db) # Seed database with primitives

        for division_id, division_dir in enumerate(division_dirs, start=1):
            print(f"Processing division {division_id}: {division_dir.name}")

            division_schema = csv_parser.schemas.get(division_id)
            if not division_schema:
                print(f"No schema exists for division {division_id}. Please ensure there is YAML file for this division.")
                continue
            
            all_csv_path_dates = [(csv_path, get_date_from_path(csv_path)) for csv_path in division_dir.glob("*.csv")]
            csv_path_dates: list[tuple[Path, datetime]] = sorted(filter(lambda csv_path_date: csv_path_date[1] is not None, all_csv_path_dates), key=lambda csv_path_date: csv_path_date[1])
            
            for csv_path, csv_date in csv_path_dates:
                print(f"Processing {csv_path.name}")

                try:
                    records, errors = csv_parser.parse_csv(csv_path, division_schema, db)
                except Exception as e:
                    print(e)
                    continue

                success_count, updated_count, errors = add_employees_from_records(records, division_id, db, csv_date)
                print(f"Created {success_count} employees with division {division_id}.")
                print(f"Updated {updated_count} employees with division {division_id}.")
                if errors: print(errors)
                