from sqlalchemy import Column, Integer, String, Date, DateTime, ForeignKey, UniqueConstraint
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func

from db import Base

class Division(Base):
    __tablename__ = "divisions"

    id = Column(Integer, primary_key=True, index=True, autoincrement=False)

    employees = relationship("Employee", back_populates="division")

class Rank(Base):
    __tablename__ = "ranks"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False, unique=True)

    employees = relationship("Employee", back_populates="rank")

class Position(Base):
    __tablename__ = "positions"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False, unique=True)

    employees = relationship("Employee", back_populates="position")

class Department(Base):
    __tablename__ = "departments"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False, unique=True)

    employees = relationship("Employee", back_populates="department")

class SalaryBand(Base):
    __tablename__ = "salary_bands"

    id = Column(Integer, primary_key=True, index=True, autoincrement=False)

    employees = relationship("Employee", back_populates="salary_band")

class Employee(Base):
    __tablename__ = "employees"

    id = Column(Integer, primary_key=True, index=True)
    first_name = Column(String, nullable=False)
    surname = Column(String, nullable=False)
    division_id = Column(Integer, ForeignKey("divisions.id"), nullable=False)
    rank_id = Column(Integer, ForeignKey("ranks.id"), nullable=False)
    position_id = Column(Integer, ForeignKey("positions.id"), nullable=False)
    department_id = Column(Integer, ForeignKey("departments.id"), nullable=False)
    salary_band_id = Column(Integer, ForeignKey("salary_bands.id"), nullable=False)
    contact_number = Column(String, nullable=False)
    start_date = Column(Date, nullable=False)
    last_updated = Column(DateTime, nullable=False, default=func.now())

    division = relationship("Division", back_populates="employees")
    rank = relationship("Rank", back_populates="employees")
    position = relationship("Position", back_populates="employees")
    department = relationship("Department", back_populates="employees")
    salary_band = relationship("SalaryBand", back_populates="employees")

    __table_args__ = (
        UniqueConstraint('first_name', 'surname', name='uq_employee_name'),
    )