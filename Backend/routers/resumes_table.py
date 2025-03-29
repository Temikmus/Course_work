import re
from fastapi import APIRouter, Depends, Query, HTTPException
from sqlalchemy.orm import Session
from database import get_db
from models import Resume
import sql_functions

router = APIRouter()


def fetch_resumes_data(
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
    """Основная логика получения данных по резюме"""
    query = db.query(Resume)

    # Обработка specific_fields
    if specific_fields and (not group_by):
        fields = specific_fields.split(",")
        if "url" not in fields:
            fields.append("url")
        query = sql_functions.add_columns_to_result(query, fields, Resume)

    # Обработка фильтров
    if filters:
        tuple_of_filters = sql_functions.parse_filters(filters)
        for column, value in tuple_of_filters.items():
            if len(value) == 3:
                query = sql_functions.apply_filter_for_column(
                    query, column, value[1], value[0], value[2], Resume
                )
            else:
                raise ValueError(f"Неправильный фильтр: {column}:{value}")

    # Группировка и агрегация
    group_columns = sql_functions.find_group_columns(group_by, Resume)
    selected_aggregates = sql_functions.find_aggregate_columns_for_group_by(aggregates, Resume)
    query = sql_functions.apply_group_by(query, group_columns, selected_aggregates)

    # Сортировка
    query = sql_functions.apply_sorting_of_table(query, group_columns, selected_aggregates, sort_by, Resume)

    # Фильтрация NULL значений
    query = sql_functions.apply_not_null_for_columns(query, not_null, Resume)

    # Условия HAVING
    if group_by and having:
        query = sql_functions.apply_having(query, having, selected_aggregates, Resume)

    # Пагинация
    total_count = query.count()
    if offset:
        query = query.offset(offset)
    if limit is not None:
        query = query.limit(limit)

    # Формирование результата
    results = query.all()
    if specific_fields or group_by or aggregates:
        response = [dict(zip([col["name"] for col in query.column_descriptions], row)) for row in results]
    else:
        response = [row.__dict__ for row in results]

    return {
        "total_count": total_count,
        "results": response
    }


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
        return fetch_resumes_data(
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
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))