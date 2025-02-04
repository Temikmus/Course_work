from fastapi import APIRouter, Depends, Query, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import func, cast, Float, and_, nullsfirst, nullslast
from database import SessionLocal
from models import Vacancy
from datetime import datetime
import re

router = APIRouter()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


@router.get("/table_groupby/")
def get_vacancies(
        specific_fields: str = Query(None, description="Выбор конкретных полей"),
        group_by: str = Query(None, description="Группировка по полю (например, 'company_name')"),
        aggregate: str = Query(None, description="Агрегатные функции (например, 'salary_from:AVG,salary_to:MAX')"),
        having: str = Query(None, description="Фильтрация агрегированных данных (например, 'AVG(salary_from)>100000')"),
        sort_by: str = Query(None, description="Сортировка по полю (например, 'salary:asc' или 'title:desc')"),
        delete_null: str = Query(False, description="Не показывать строки, где есть null значения, True-не показывать"),
        limit: int = Query(15, ge=1, le=100, description="Количество записей для отображения (максимум 100)"),
        offset: int = Query(0, description="Смещение для пагинации"),
        db: Session = Depends(get_db)
):
    query = db.query(Vacancy)
    group_columns = []
    aggregate_funcs = []

    if group_by:
        group_columns = [getattr(Vacancy, col.strip()) for col in group_by.split(",") if hasattr(Vacancy, col.strip())]
        query = query.group_by(*group_columns)

    if aggregate:
        for agg in aggregate.split(","):
            try:
                column, func_name = agg.split(":")
                col_attr = getattr(Vacancy, column.strip(), None)
                agg_func = getattr(func, func_name.strip().lower(), None)
                if col_attr and agg_func:
                    # Создаем новый alias для агрегированной функции
                    aggregate_funcs.append(agg_func(col_attr).label(f"{func_name.strip().lower()}_{column.strip()}"))
            except ValueError:
                continue  # Игнорируем неверные агрегации

        if aggregate_funcs:
            query = query.with_entities(*group_columns, *aggregate_funcs)

    if having:
        having_conditions = []
        for condition in having.split(","):
            match = re.match(r"(\w+)\((\w+)\)\s*([><=!]+)\s*(\d+)", condition.strip())
            if match:
                func_name, col_name, operator, value = match.groups()
                col_attr = getattr(Vacancy, col_name.strip(), None)
                agg_func = getattr(func, func_name.strip().lower(), None)
                if col_attr and agg_func:
                    having_conditions.append(getattr(agg_func(col_attr), operator)(float(value)))
        if having_conditions:
            query = query.having(*having_conditions)

    if sort_by:
        try:
            sort_column, sort_order = sort_by.split(":")

            # Если сортировка по агрегированному столбцу
            col_attr = None
            if sort_column.startswith(('avg', 'sum', 'max', 'min', 'count')):
                # Ищем агрегированную функцию по её alias
                for agg_func in aggregate_funcs:
                    if agg_func.name == sort_column:
                        col_attr = agg_func
                        break
            else:
                col_attr = getattr(Vacancy, sort_column.strip(), None)

            # Проверка на наличие столбца или агрегированной функции
            if col_attr is not None:
                if delete_null:
                    query = query.filter(col_attr.isnot(None))

                # Сортировка в нужном порядке
                if sort_order.lower() == "desc":
                    query = query.order_by(col_attr.desc().nullslast())
                else:
                    query = query.order_by(col_attr.asc().nullslast())
            else:
                raise ValueError(f"Column or aggregation function {sort_column} not found.")

        except ValueError as e:
            # Логирование ошибки сортировки
            print(f"Error in sort_by parameter: {e}")

    total_count = query.count()

    if offset:
        query = query.offset(offset)
    if limit is not None:
        query = query.limit(limit)

    # Преобразование результата в список словарей
    if specific_fields:
        results = query.all()
        response = [dict(zip(specific_fields.split(","), row)) for row in results]
    else:
        results = query.all()
        response = [row._asdict() for row in results]

    return {
        "total_count": total_count,
        "results": response
    }
