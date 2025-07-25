# Toumetis Technical Challenge

## Author Notes

Thank you very much for taking the time to overlook my technical challenge submission. As I am volunteering away in the coming days, I’ve reached the limit of what I’m able to deliver at this time. There are several areas I would have liked to develop further particularly around component reusability, improved styling, and the inclusion of unit and integration testing. This application was also only designed for desktop viewports and does not yet include ARIA labels for assistive technologies. There are also some limitations that are mentioned in the README that I would have liked to tackle. That said, I’m proud of what I’ve accomplished and have aimed to ensure the solution is scalable, performant, and aligned with professional best practices. I also took particular care to make the system accessible and modifiable by non-technical users, such as HR personnel, assuming basic familiarity with YAML. All project requirements have been met and, in many cases, exceeded so I hope you find it worthy.

## Overview
Based on the provided requirements, I have created a basic employee dashboard web application powered by a JavaScript-Vite-React-TailwindCSS frontend and a Python-FastAPI backend. Using it, you can create, read, update, and delete employee records (CRUD). Use the searchbar on the home page to filter by any column, or prefix with '#' to search by employee ID (eg. #145).

You are able to upload employee CSVs by division through the application or in bulk through the provided script. Invalid employees will be skipped. Before uploading any employee-division CSVs, please first ensure a schema YAML is defined in the `./backend/division_schemas/` directory. The first and second division schemas have already been created.

*Please note employees created through any type of CSV ingestion or submission cannot have identical first or surnames.*

## Database

This web application is backed by an SQLite database that is fully normalised for the given scenario. The `./backend/config.yaml` file contains a configuration that will pre-populate the database with **divisions**, **ranks**, **positions**, **departments**, and **salary bands** at either application or script runtime. This configuration is editable.

## Quick Start

*Please note Docker (and Docker Compose) is required to run this application. Additionally, ensure you are located in the project root.*

To start the application please run:

```
docker compose up --build
```

Then, in your intenet browser, navigate to `localhost:3000` for the website or `localhost:8000/docs` for the API documentation provided by FastAPI.

### CSV Ingestion Script

*Please note Python 3.12 and other dependencies are required to run this script. Additionally, ensure you are located in the project root.*

The CSV ingestion script is given a directory for which it will iterate sub-directories named with "division", finding all the CSV files that are suffixed with YYYYMMDD, and commit to the database.

Firstly, ensure the correct environment variables are set or available at `backend/.env`:

```
DATABASE_URL=sqlite:///./dev.db
CONFIG_PATH=config.yaml
SCHEMA_DIR_PATH=division_schemas
```

To start the script please run:

```
cd backend
pip install -r requirements.txt
python ingest.py /path/to/directory
```