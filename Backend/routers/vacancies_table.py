from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from database.db_connection import get_db
from database.models import Vacancy
from support_functions.fetch_table import fetch_table_data


router = APIRouter()


@router.get("/table/")
def get_vacancies_main_table(
    specific_fields: str = Query(None),
    filters: str = Query(None),
    group_by: str = Query(None),
    having: str = Query(None),
    aggregates: str = Query(None),
    not_null: str = Query(None),
    sort_by: str = Query(None),
    limit: int = Query(8, ge=1),
    offset: int = Query(0),
    db: Session = Depends(get_db),
):
    return fetch_table_data(
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
        base_model=Vacancy
    )