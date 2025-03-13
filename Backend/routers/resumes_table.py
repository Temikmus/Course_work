from fastapi import APIRouter, Depends, Query, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import func, cast, Float, and_, or_
from database import SessionLocal
from models import Resume
from datetime import datetime

router = APIRouter()


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

def comparison_with_simliar_name(query, filters):
    for column, value in filters.items():
        if value:
            query = query.filter(getattr(Resume, column).ilike(f"%{value}%"))
    return query

def comparison_with_simliar_names_and(query, filters):
    for column, value in filters.items():
        if value:
            values_list = value.split(",")
            conditions = [getattr(Resume, column).any(li) for li in values_list]
            query = query.filter(and_(*conditions))
    return query

def comparison_with_simliar_names_or(query, filters):
    for column, value in filters.items():
        if value:
            values_list = value.split(",")
            conditions = [getattr(Resume, column).any(li) for li in values_list]
            query = query.filter(or_(*conditions))
    return query



@router.get("/table/")
def get_vacancies(
    specific_fields: str = Query(None, description="Выбор конкретных полей"),
    title: str = Query(None, description="Название профессии"),
    min_age: int = Query(None, description="Минимальный возраст соискателя"),
    max_age: int = Query(None, description="Максимальный возраст соискателя"),
    gender: str = Query(None, description="Пол соискателя"),
    photo: str = Query(None, description="Есть фото true/false"),
    is_driver: str = Query(None, description="Водитель true/false"),
    currency: str = Query(None, description="Валюта"),
    skills: str = Query(None, description="Навыки (ключевые слова)"),
    min_level_eng: str = Query(None, description="Минимальный уровень англ. языка"),
    max_level_eng: str = Query(None, description="Максимальный уровень англ. языка"),
    min_level_zho: str = Query(None, description="Минимальный уровень китайского языка"),
    max_level_zho: str = Query(None, description="Максимальный уровень китайского языка"),
    address: str = Query(None, description="Город"),
    level_education: str = Query(None, description="Уровень образования"),
    published_after: str = Query(None, description="Опубликовано после (формат: YYYY-MM-DD)"),
    published_before: str = Query(None, description="Опубликовано до (формат: YYYY-MM-DD)"),
    edited_after: str = Query(None, description="Редактировано после (формат: YYYY-MM-DD)"),
    edited_before: str = Query(None, description="Редактировано до (формат: YYYY-MM-DD)"),
    citizenship: str = Query(None, description="Гражданство"),
    university: str = Query(None, description="Университет (хотя бы один из перечисл.)"),
    professional_roles: str = Query(None,
                                    description="Профессиональные роли (хотя бы один из перечисл.)"),
    employments: str = Query(None, description="Формат работы (хотя бы один из перечисл.)"),
    schedules: str = Query(None, description="Формат рабочего времени (хотя бы один из перечисл.)"),
    experience: str = Query(None, description="Компании, где работал (хотя бы один из перечисл.)"),
    min_experience: int = Query(None, description="Минимальный опыт работы (в месяцах)"),
    max_experience: int = Query(None, description="Максимальный опыт работы (в месяцах)"),
    min_salary: float = Query(None, description="Минимальная зарплата"),
    max_salary: float = Query(None, description="Максимальная зарплата"),
    min_count_additional_courses: int = Query(None,
                                              description="Минимальное кол-во доп. образования"),
    max_count_additional_courses: int = Query(None,
                                              description="Максимальное кол-во доп. образования"),
    not_null: str = Query(None, description="Столбцы, которые должны быть со значениями"),
    sort_by: str = Query(None,
                         description="Сортировка по полю (например, 'salary:asc' или 'title:desc')"),
    limit: int = Query(15, ge=1, le=100,
                       description="Количество вакансий для отображения (максимум 100)"),
    offset: int = Query(0, description="Смещение для пагинации"),
    db: Session = Depends(get_db)
):
    query = db.query(Resume)
    # Обработка specific_fields (если нужно вернуть только определенные поля)
    if specific_fields:
        fields = specific_fields.split(",")  # Пример: "salary_from,salary_to"
        if "url" not in fields:
            fields.append("url")
        selected_columns = []
        for field in fields:
            if hasattr(Resume, field):
                selected_columns.append(getattr(Resume, field))
            else:
                raise HTTPException(status_code=400, detail=f"Поле '{field}' не существует")
        if selected_columns:
            query = query.with_entities(*selected_columns)
    #Фильтрация (если значение передано)
    columns_for_compare_with_similar_name = {
        'title': title,
        'gender': gender,
        'currency': currency,
        'level_education': level_education,
    }
    query = comparison_with_simliar_name(query, columns_for_compare_with_similar_name)

    columns_for_compare_with_similar_names_and = {
        'citizenship': citizenship,
        'skill_set': skills,
    }
    query = comparison_with_simliar_names_and(query, columns_for_compare_with_similar_names_and)

    columns_for_compare_with_similar_names_or = {
        'university': university,
        'professional_roles': professional_roles,
        'employments': employments,
        'schedules': schedules,
        'experience': experience
    }
    query = comparison_with_simliar_names_or(query, columns_for_compare_with_similar_names_or)

    if min_age is not None:
        query = query.filter(Resume.age >= min_age)
    if max_age is not None:
        query = query.filter(Resume.age <= max_age)
    language_levels = {
        "a1": 1,
        "a2": 2,
        "b1": 3,
        "b2": 4,
        "c1": 5,
        "c2": 6
    }
    if min_level_eng:
        min_level = language_levels.get(min_level_eng)
        if min_level is None:
            raise HTTPException(status_code=400, detail="Некорректный минимальный уровень английского языка.")
    if max_level_eng:
        max_level = language_levels.get(max_level_eng)
        if max_level is None:
            raise HTTPException(status_code=400, detail="Некорректный максимальный уровень английского языка.")
    if min_level_eng or max_level_eng:
        conditions = []
        if min_level_eng:
            conditions.append(
                Resume.language_eng.in_([level for level, value in language_levels.items() if value >= min_level]))
        if max_level_eng:
            conditions.append(
                Resume.language_eng.in_([level for level, value in language_levels.items() if value <= max_level]))
        if conditions:
            query = query.filter(and_(*conditions))
    if min_level_zho:
        min_level = language_levels.get(min_level_zho)
        if min_level is None:
            raise HTTPException(status_code=400, detail="Некорректный минимальный уровень китайского языка.")
    if max_level_zho:
        max_level = language_levels.get(max_level_zho)
        if max_level is None:
            raise HTTPException(status_code=400, detail="Некорректный максимальный уровень китайского языка.")
    if min_level_zho or max_level_zho:
        conditions = []
        if min_level_zho:
            conditions.append(
                Resume.language_zho.in_([level for level, value in language_levels.items() if value >= min_level]))
        if max_level_zho:
            conditions.append(
                Resume.language_zho.in_([level for level, value in language_levels.items() if value <= max_level]))
        if conditions:
            query = query.filter(and_(*conditions))

    if published_after:
        try:
            published_after_date = datetime.strptime(published_after, "%Y-%m-%d")
        except ValueError:
            raise HTTPException(status_code=400, detail="Некорректный формат даты. Используйте YYYY-MM-DD.")
        query = query.filter(Resume.created_at >= published_after_date)
    if published_before:
        try:
            published_before_date = datetime.strptime(published_before, "%Y-%m-%d")
        except ValueError:
            raise HTTPException(status_code=400,
                                detail="Некорректный формат даты. Используйте YYYY-MM-DD.")
        query = query.filter(Resume.created_at <= published_before_date)
    if edited_after:
        try:
            edited_after_date = datetime.strptime(edited_after, "%Y-%m-%d")
        except ValueError:
            raise HTTPException(status_code=400, detail="Некорректный формат даты. Используйте YYYY-MM-DD.")
        query = query.filter(Resume.updated_at >= edited_after_date)
    if edited_before:
        try:
            edited_before_date = datetime.strptime(edited_before, "%Y-%m-%d")
        except ValueError:
            raise HTTPException(status_code=400,
                                detail="Некорректный формат даты. Используйте YYYY-MM-DD.")
        query = query.filter(Resume.updated_at <= edited_before_date)
    if photo:
        if photo == "true":
            photo_bool = True
        elif photo == "false":
            photo_bool = False
        else:
            raise HTTPException(status_code=400,
                                detail="Некорректное значение для параметра photo.")
        query = query.filter(Resume.photo == photo_bool)
    if is_driver:
        if is_driver == "true":
            is_driver_bool = True
        elif is_driver == "false":
            is_driver_bool = False
        else:
            raise HTTPException(status_code=400,
                                detail="Некорректное значение для параметра is_driver.")
        query = query.filter(Resume.is_driver == is_driver_bool)
    if min_experience is not None:
        query = query.filter(Resume.total_experience >= min_experience)
    if max_experience is not None:
        query = query.filter(Resume.total_experience <= max_experience)
    if min_count_additional_courses is not None:
        query = query.filter(Resume.count_additional_courses >= min_count_additional_courses)
    if max_count_additional_courses is not None:
        query = query.filter(Resume.count_additional_courses <= max_count_additional_courses)
    if min_salary is not None:
        query = query.filter(Resume.salary >= min_salary)
    if max_salary is not None:
        query = query.filter(Resume.salary <= max_salary)

    if sort_by:
        field, order = sort_by.split(":")
        if hasattr(Resume, field):
            column = getattr(Resume, field)
            if order == "asc":
                query = query.order_by(column.asc())
            elif order == "desc":
                query = query.order_by(column.desc())
        else:
            raise HTTPException(status_code=400, detail=f"Поле '{field}' не существует")

    if not_null:
        not_null_columns = not_null.split(",")
        for column in not_null_columns:
            if hasattr(Resume, column):
                query = query.filter(getattr(Resume, column).isnot(None))
            else:
                raise HTTPException(status_code=400, detail=f"Поле '{column}' не существует.")

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