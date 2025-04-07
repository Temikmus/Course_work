from fastapi import APIRouter, Depends, Query, HTTPException
from sqlalchemy.orm import Session
from database.db_connection import get_db
from database.models import Resume
from support_functions.fetch_table import fetch_table_data

router = APIRouter()


@router.get("/table/")
def get_resume_main_table(
        specific_fields: str = Query(None, description="Выбор выводимых полей"),
        filters: str = Query(None, description="Фильтры для полей"),
        group_by: str = Query(None, description="Поле для группировки"),
        having: str = Query(None, description="Фильтры для полей с агрегирующими функциями"),
        aggregates: str = Query(None, description="Агрегаты (например, 'salary:AVG,age:COUNT')"),
        not_null: str = Query(None, description="Столбцы, которые должны быть со значениями"),
        sort_by: str = Query(None, description="Сортировка по полю"),
        limit: int = Query(8, ge=1, le=100, description="Количество записей (максимум 100)"),
        offset: int = Query(0, description="Смещение для пагинации"),
        db: Session = Depends(get_db)
):
    try:
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
            base_model=Resume
        )
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))