from fastapi import APIRouter, Depends, Query, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import func, cast, Float, and_
from database import SessionLocal
from models import Vacancy
from datetime import datetime

router = APIRouter()


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@router.get("/vacancies/table")
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
    min_salary: int = Query(None, description="Минимальная зарплата"),
    max_salary: int = Query(None, description="Максимальная зарплата"),
    bonus: str = Query(None, description="Информация о премиях true/false"),
    limit: int = Query(15, ge=1, le=100,
                       description="Количество вакансий для отображения (максимум 100)"),
    offset: int = Query(0, description="Смещение для пагинации"),
    db: Session = Depends(get_db)
):
    query = db.query(Vacancy)
    # Обработка specific_fields (если нужно вернуть только определенные поля)
    if specific_fields:
        fields = specific_fields.split(",")  # Пример: "salary_from,salary_to"
        if "url" not in fields:
            fields.append("url")
        selected_columns = []
        for field in fields:
            if hasattr(Vacancy, field):
                selected_columns.append(getattr(Vacancy, field))
            else:
                raise HTTPException(status_code=400, detail=f"Поле '{field}' не существует")
        if selected_columns:
            query = query.with_entities(*selected_columns)

    # Фильтрация (если значение передано)
    if title:
        query = query.filter(Vacancy.title.ilike(f"%{title}%"))
    if company_name:
        query = query.filter(Vacancy.company_name.ilike(f"%{company_name}%"))
    if currency:
        query = query.filter(Vacancy.currency.ilike(f"%{currency}%"))
    if experience:
        query = query.filter(Vacancy.experience.ilike(f"%{experience}%"))
    if type_of_employment:
        query = query.filter(Vacancy.type_of_employment.ilike(f"%{type_of_employment}%"))
    if work_format:
        query = query.filter(Vacancy.work_format.ilike(f"%{work_format}%"))
    if skills:
        skills_list = skills.split(",")
        conditions = [Vacancy.skills.any(skill) for skill in skills_list]
        query = query.filter(and_(*conditions))
    if address:
        query = query.filter(Vacancy.address.ilike(f"%{address}%"))
    if published_after:
        try:
            published_after_date = datetime.strptime(published_after, "%Y-%m-%d")
        except ValueError:
            raise HTTPException(status_code=400, detail="Некорректный формат даты. Используйте YYYY-MM-DD.")
        query = query.filter(Vacancy.published_at >= published_after_date)
    if published_before:
        try:
            published_before_date = datetime.strptime(published_before, "%Y-%m-%d")
        except ValueError:
            raise HTTPException(status_code=400,
                                detail="Некорректный формат даты. Используйте YYYY-MM-DD.")
        query = query.filter(Vacancy.published_at <= published_before_date)
    if archived:
        if archived == "true":
            archived_bool = True
        elif archived == "false":
            archived_bool = False
        else:
            raise HTTPException(status_code=400,
                                detail="Некорректное значение для параметра archived.")
        query = query.filter(Vacancy.archived == archived_bool)
    if min_experience is not None:
        query = query.filter(Vacancy.min_experience >= min_experience)
    if max_experience is not None:
        query = query.filter(Vacancy.max_experience <= max_experience)
    if min_salary is not None:
        query = query.filter(Vacancy.salary_from >= min_salary)
    if max_salary is not None:
        query = query.filter(Vacancy.salary_to <= max_salary)
    if bonus is not None:
        if bonus == "true":
            query = query.filter(Vacancy.bonus.isnot(None))
        elif bonus == "false":
            query = query.filter(Vacancy.bonus.is_(None))
        else:
            raise HTTPException(status_code=400,
                                detail="Некорректное значение для параметра bonus.")

    total_count = query.count()

    if offset:
        query = query.offset(offset)
    if limit is not None:
        query = query.limit(limit)

    # Преобразование результата в список словарей
    if specific_fields:
        # Если выбраны конкретные поля, результат — это кортежи
        results = query.all()
        response = [dict(zip(fields, row)) for row in results]
    else:
        # Если выбраны все поля, результат — это объекты модели
        results = query.all()
        response = [row.__dict__ for row in results]

    # Возврат данных и общего количества записей
    return {
        "total_count": total_count,
        "results": response
    }
