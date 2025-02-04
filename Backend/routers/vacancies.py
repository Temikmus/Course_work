from fastapi import APIRouter, Depends, Query, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import func, and_, or_
from database import SessionLocal
from models import Vacancy
from datetime import datetime
import logging

router = APIRouter()


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

def to_time(time):
    try:
        time = datetime.strptime(time, "%Y-%m-%d")
        return time
    except ValueError:
        logging.warning(f"Некорректный формат даты: {time}")
        return None


#Значение поля должно быть больше или равно чем данное
def field_more_than_value(query, filters):
    for column, value in filters.items():
        if value:
            query = query.filter(getattr(Vacancy, column) >= value)
    return query

#Значение поля должно быть больше или равно чем данное
def field_less_than_value(query, filters):
    for column, value in filters.items():
        if value:
            query = query.filter(getattr(Vacancy, column) <= value)
    return query

def compare_column_with_values_and(query, filters):
    for column, value in filters.items():
        if value:
            values_list = value.split(",")
            conditions = [getattr(Vacancy, column).any(li) for li in values_list]
            query = query.filter(and_(*conditions))
    return query

def compare_column_with_values_or(query, filters):
    for column, value in filters.items():
        if value:
            values_list = value.split(",")
            conditions = [getattr(Vacancy, column).any(li) for li in values_list]
            query = query.filter(or_(*conditions))
    return query


def compare_column_with_value(query, filters):
    for column, value in filters.items():
        if value:
            query = query.filter(getattr(Vacancy, column).ilike(f"%{value}%"))
    return query

def add_columns_to_result(query, fields):
    selected_columns = []
    for field in fields:
        if hasattr(Vacancy, field):
            selected_columns.append(getattr(Vacancy, field))
        else:
            raise HTTPException(status_code=400, detail=f"Поле '{field}' не существует")
    if selected_columns:
        query = query.with_entities(*selected_columns)
    return query

@router.get("/table_main/")
def get_vacancies_main_table(
        specific_fields: str = Query(None, description="Выбор конкретных полей"),
        title: str = Query(None, description="Название вакансии"),
        company_name: str = Query(None, description="Название компании"),
        currency: str = Query(None, description="Валюта"),
        experience: str = Query(None, description="Опыт работы"),
        type_of_employment: str = Query(None, description="Тип занятости"),
        work_format: str = Query(None, description="Формат работы"),
        skills: str = Query(None, description="Навыки (ключевые слова)"),
        address: str = Query(None, description="Город"),
        published_after: str = Query(None, description="Опубликовано после (формат: YYYY-MM-DD)"),
        published_before: str = Query(None, description="Опубликовано до (формат: YYYY-MM-DD)"),
        archived: str = Query(None, description="Архивная да/нет"),
        min_experience: int = Query(None, description="Минимальный опыт работы"),
        max_experience: int = Query(None, description="Максимальный опыт работы"),
        salary_from: int = Query(None, description="Минимальная зарплата"),
        salary_to: int = Query(None, description="Максимальная зарплата"),
        bonus: str = Query(None, description="Информация о премиях true/false"),
        not_null: str = Query(None, description="Столбцы, которые должны быть со значениями"),
        group_by: str = Query(None, description="Поле для группировки"),
        aggregates: str = Query(None, description="Агрегаты (например, 'salary_to:AVG,salary_from:SUM')"),
        sort_by: str = Query(None, description="Сортировка по полю (например, 'salary_from:asc' или 'title:desc')"),
        delete_null: str = Query(None, description="Исключать null значения из агрегатов"),
        limit: int = Query(15, ge=1, le=100, description="Количество вакансий для отображения (максимум 100)"),
        offset: int = Query(0, description="Смещение для пагинации"),
        db: Session = Depends(get_db)
):
    query = db.query(Vacancy)
    # Обработка specific_fields (если нужно вернуть только определенные поля) только для случая, когда нет группировки
    if specific_fields and (not(group_by)):
        fields = specific_fields.split(",")  # Пример: "salary_from,salary_to"
        if "url" not in fields:
            fields.append("url")
        query = add_columns_to_result(query, fields)

    # Фильтрация по совпадению поля со значением
    columns_for_compare_with_value = {
        'title': title,
        'company_name': company_name,
        'currency': currency,
        'experience': experience,
        'type_of_employment': type_of_employment,
        'work_format': work_format,
        'address': address,
    }
    query = compare_column_with_value(query, columns_for_compare_with_value)

    # Фильтрация по наличию у поля всех перечислинных значений
    columns_for_compare_with_values_and = {
        'skills': skills
    }
    query = compare_column_with_values_and(query, columns_for_compare_with_values_and)

    published_after = to_time(published_after) if published_after else None

    #столбцы для сравнения со значением, значение поля должно быть больше или равно данного значения
    columns_for_compare_more = {
        'published_after': published_after
    }
    query = field_more_than_value(query, columns_for_compare_more)

    published_before = to_time(published_before) if published_before else None

    #столбцы для сравнения со значением, значение поля должно быть меньше или равно данного значения
    columns_for_compare_less = {
        'published_before': published_before
    }
    query = field_less_than_value(query, columns_for_compare_less)

    if published_before:
        try:
            published_before_date = datetime.strptime(published_before, "%Y-%m-%d")
        except ValueError:
            raise HTTPException(status_code=400, detail="Некорректный формат даты. Используйте YYYY-MM-DD.")
        query = query.filter(Vacancy.published_at <= published_before_date)
    if archived:
        archived_bool = True if archived == "true" else False if archived == "false" else None
        if archived_bool is not None:
            query = query.filter(Vacancy.archived == archived_bool)
        else:
            raise HTTPException(status_code=400, detail="Некорректное значение для параметра archived.")
    if min_experience is not None:
        query = query.filter(Vacancy.min_experience >= min_experience)
    if max_experience is not None:
        query = query.filter(Vacancy.max_experience <= max_experience)
    if salary_from is not None:
        query = query.filter(Vacancy.salary_from >= salary_from)
    if salary_to is not None:
        query = query.filter(Vacancy.salary_to <= salary_to)
    if bonus is not None:
        query = query.filter(Vacancy.bonus.isnot(None) if bonus == "true" else Vacancy.bonus.is_(None))
    if not_null:
        not_null_columns = not_null.split(",")
        for column in not_null_columns:
            if hasattr(Vacancy, column):
                query = query.filter(getattr(Vacancy, column).isnot(None))
            else:
                raise HTTPException(status_code=400, detail=f"Поле '{column}' не существует.")

    # Применение агрегации и группировки, если переданы параметры
    # if group_by and aggregates:
    #     query = aggregate_vacancies(query, group_by, aggregates, sort_by, delete_null)

    total_count = query.count()

    # Пагинация
    if offset:
        query = query.offset(offset)
    if limit is not None:
        query = query.limit(limit)

    results = query.all()
    response = [row.__dict__ for row in results]

    return {
        "total_count": total_count,
        "results": response
    }

