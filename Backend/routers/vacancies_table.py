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
import sql_fucntions


router = APIRouter()




"""
Для работы с русскими зп - все столбцы будут идти с приставкой russian_...
То есть если пользователь хочет видеть зп с русскими столбцами, то вместо salary_to будет в запросе russian_salary_to
"""

@router.get("/table/")
def get_vacancies_main_table(
        specific_fields: str = Query(None, description="Выбор выводимых полей"),
        filters: str = Query(None, description="Фильтры для полей"),
        group_by: str = Query(None, description="Поле для группировки"),
        having: str = Query(None, description="Фильтры для полей с агрегирующими функциями"),
        aggregates: str = Query(None, description="Агрегаты (например, 'salary_to:AVG,salary_from:SUM')"),
        not_null: str = Query(None, description="Столбцы, которые должны быть со значениями"),
        sort_by: str = Query(None, description="Сортировка по полю (например, 'salary_from:asc' или 'title:desc')"),
        limit: int = Query(8, ge=1, le=100, description="Количество вакансий для отображения (максимум 100)"),
        offset: int = Query(0, description="Смещение для пагинации"),
        db: Session = Depends(get_db)
):
    query = db.query(Vacancy)


    # Обработка specific_fields (если нужно вернуть только определенные поля)
    if specific_fields and (not (group_by)):
        fields = specific_fields.split(",")  # Пример: "salary_from,salary_to"
        if "url" not in fields:
            fields.append("url")
        query = sql_fucntions.add_columns_to_result(query, fields, Vacancy)


    # Обработка фильтров
    if filters:
        tuple_of_filters = sql_fucntions.parse_filters(filters)
        for column, value in tuple_of_filters.items():
            if len(value) == 3:
                query = sql_fucntions.apply_filter_for_column(query, column, value[1], value[0], value[2], Vacancy)
            else:
                raise HTTPException(status_code=400, detail=f"Значение '{column}:{value}' неправильно заполнено")

    # Заполняем столбцы для группировки
    group_columns = sql_fucntions.find_group_columns(group_by, Vacancy)
    # Заполняем столбцы, которые будут агрегрироваться в группировке
    selected_aggregates = sql_fucntions.find_aggregate_columns_for_group_by(aggregates, Vacancy)
    # Применяем группировку (если ее нет, то query останется прежним)
    query = sql_fucntions.apply_group_by(query, group_columns, selected_aggregates)
    # Применяем сортировку
    query = sql_fucntions.apply_sorting_of_table(query, group_columns, selected_aggregates, sort_by, Vacancy)
    # Применяем not_null
    query = sql_fucntions.apply_not_null_for_columns(query, not_null, Vacancy)
    # Применяем having (если группировка есть)
    if group_by and having:
        query = sql_fucntions.apply_having(query, having, selected_aggregates, Vacancy)

    total_count = query.count()

    # Пагинация
    if offset:
        query = query.offset(offset)
    # Кол-во сообщений
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

