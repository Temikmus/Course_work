import re
from fastapi import APIRouter, Depends, Query, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import func, and_, or_, cast, case
from database import SessionLocal, get_db
from models import Vacancy
from datetime import datetime
from sqlalchemy.dialects.postgresql import ARRAY, VARCHAR
from sqlalchemy.types import String, DateTime, Date, ARRAY
from sqlalchemy.sql.functions import percentile_cont
from sqlalchemy.sql.expression import select
import sql_functions


router = APIRouter()

def fetch_vacancies_data(
    db: Session,
    specific_fields: str = None,
    filters: str = None,
    group_by: str = None,
    having: str = None,
    aggregates: str = None,
    not_null: str = None,
    sort_by: str = None,
    limit: int = 8,
    offset: int = 0,
):
    """Основная логика получения данных, которую можно вызывать и из API, и из других функций."""
    query = db.query(Vacancy)

    if specific_fields and (not group_by):
        fields = specific_fields.split(",")
        if "url" not in fields:
            fields.append("url")
        query = sql_functions.add_columns_to_result(query, fields, Vacancy)

    if filters:
        tuple_of_filters = sql_functions.parse_filters(filters)
        for column, value in tuple_of_filters.items():
            if len(value) == 3:
                query = sql_functions.apply_filter_for_column(query, column, value[1], value[0], value[2], Vacancy)
            else:
                raise ValueError(f"Неправильный фильтр: {column}:{value}")

    group_columns = sql_functions.find_group_columns(group_by, Vacancy)
    selected_aggregates = sql_functions.find_aggregate_columns_for_group_by(aggregates, Vacancy)
    query = sql_functions.apply_group_by(query, group_columns, selected_aggregates)
    query = sql_functions.apply_sorting_of_table(query, group_columns, selected_aggregates, sort_by, Vacancy)
    query = sql_functions.apply_not_null_for_columns(query, not_null, Vacancy)

    if group_by and having:
        query = sql_functions.apply_having(query, having, selected_aggregates, Vacancy)

    total_count = query.count()

    if offset:
        query = query.offset(offset)
    if limit is not None:
        query = query.limit(limit)

    results = query.all()

    if specific_fields or group_by or aggregates:
        response = [dict(zip([col["name"] for col in query.column_descriptions], row)) for row in results]
    else:
        response = [row.__dict__ for row in results]

    return {
        "total_count": total_count,
        "results": response
    }



"""
Для работы с русскими зп - все столбцы будут идти с приставкой russian_...
То есть если пользователь хочет видеть зп с русскими столбцами, то вместо salary_to будет в запросе russian_salary_to
"""

@router.get("/table/")
def get_vacancies_main_table(
    specific_fields: str = Query(None),
    filters: str = Query(None),
    group_by: str = Query(None),
    having: str = Query(None),
    aggregates: str = Query(None),
    not_null: str = Query(None),
    sort_by: str = Query(None),
    limit: int = Query(8, ge=1, le=100),
    offset: int = Query(0),
    db: Session = Depends(get_db),
):
    return fetch_vacancies_data(
        db=db,
        specific_fields=specific_fields,
        filters=filters,
        group_by=group_by,
        having=having,
        aggregates=aggregates,
        not_null=not_null,
        sort_by=sort_by,
        limit=limit,
        offset=offset,
    )