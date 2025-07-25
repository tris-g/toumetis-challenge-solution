import yaml
from io import StringIO,BytesIO
from pathlib import Path
from typing import Callable
from re import Match, match
from sqlalchemy.orm import Session
from pandas import read_csv

from models import Rank, Position, Department, SalaryBand
from db_ops import resolve_fk
from utils import clean_contact_number

DIVISION_SCHEMAS_DIR = "./division_schemas"
MODEL_REG = {
    'rank':        (Rank, 'rank_id', 'name'),
    'position':    (Position, 'position_id', 'name'),
    'department':  (Department, 'department_id', 'name'),
    'salary_band': (SalaryBand, 'salary_band_id', 'id')
}
TYPE_FUNCTION_REG = {'boolean': bool, 'string': str, 'integer': int, 'date': str}
TRANSFORM_FUNCTION_REG = {'clean_contact_number': clean_contact_number}

class DivisionCSVParser:
    def __init__(self, schemas: dict[int, dict], model_registry: dict[str, tuple], type_registry: dict[str, Callable], transform_registry: dict[str, dict]):
        self.schemas = schemas
        self.model_registry = model_registry
        self.type_registry = type_registry
        self.transform_registry = transform_registry
    
    @classmethod
    def from_schema_dir(cls, schema_dir: str, model_registry: dict[str, tuple], type_registry: dict[str, Callable],transform_registry: dict[str, dict]):
        """Creates a DivisionCSVParser from a directory of YAML schemas."""
        schema_dir_path = Path(schema_dir)
        schemas = {}
        for path in schema_dir_path.glob("*.yaml"):
            with path.open("r") as f:
                config = yaml.safe_load(f)
                division_id = config.get("division_id")
                if division_id:
                    schemas[division_id] = config
                else:
                    print(f"Missing division_id in {path.name}")
        return cls(schemas, model_registry, type_registry, transform_registry)
    
    def apply_transform(self, header, val, transform: dict) -> dict:
        """Applies a transform onto a header and value using transform function."""
        transform_type = transform.get('type')
        if transform_type == "func":
            action = transform.get('action')
            func = self.transform_registry.get(action)
            if not func:
                raise ValueError(f"No function named '{func}' registered")
            else:
                return {header: func(val)}
        elif transform_type == "regex":
            pattern = transform.get('pattern')
            groups = transform.get('groups')
            match_result = match(transform['pattern'], val)
            if not isinstance(match_result, Match):
                raise ValueError(f"Regex pattern '{pattern}' did not match '{val}'")
            return {groups[key]: match_result.group(key) for key in groups.keys()}
        else:
            raise ValueError(f"Unknown transform type of '{transform_type}'")

    def parse_csv(self, file: Path | StringIO |BytesIO, division_schema: dict, db: Session):
        """
        Parse a CSV file for employee ingestion by division.
        
        # Parameters
        file : Path or StringIO or BytesIO
            Path to CSV file.
        division_schema : dict
            Division schema as defined by one of the YAML files in the `./division_schemas/` directory.
        db :S ession
            Database session.

        # Returns
        records : list[dict]
            Employee records.
        errors : list[dict]
            List of errors.
        """
        headers: dict[str, str] = division_schema.get("headers")
        transforms: dict[str, dict] = division_schema.get("transforms")
        
        dtypes = {}; parse_dates = []
        for col, typ in headers.items():
            if typ == "date":
                parse_dates.append(col)
            elif typ in self.type_registry:
                dtypes[col] = self.type_registry[typ]

        df = read_csv(file, names=headers, skiprows=1, dtype=dtypes, parse_dates=parse_dates)
        records = []; errors = []
        for row in df.itertuples():
            record = {}
            try:
                for header in headers:
                    val = getattr(row, header)
                    transform = transforms.get(header)
                    if transform:
                        record.update(self.apply_transform(header, val, transform))
                    else:
                        record[header] = val
                # Mutate headers to match database ids
                for header in list(record.keys()):
                    model_info = self.model_registry.get(header)
                    if model_info:
                        model, new_header, match_on = model_info
                        value = record[header]

                        if match_on == "id":
                            record[new_header] = value
                        else:
                            record[new_header] = resolve_fk(model, value, db)

                        del record[header]
                records.append(record)
            except Exception as e:
                errors.append({"row": row.Index, "error": str(e)})
        return records, errors

csv_parser = DivisionCSVParser.from_schema_dir(DIVISION_SCHEMAS_DIR, MODEL_REG, TYPE_FUNCTION_REG, TRANSFORM_FUNCTION_REG)