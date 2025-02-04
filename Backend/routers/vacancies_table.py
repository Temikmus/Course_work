import re
from fastapi import APIRouter, Depends, Query, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import func, and_, or_, cast
from database import SessionLocal
from models import Vacancy
from datetime import datetime
from sqlalchemy.dialects.postgresql import ARRAY, VARCHAR
from sqlalchemy.types import String, DateTime, Date


router = APIRouter()


# Применяем фильтр для столбца типа array (например, skills)
def apply_compare_filter_for_array_column(query: Query, column: str, values, operator: str, separator: str):
    column_attr = getattr(Vacancy, column, None)
    if not column_attr:
        raise ValueError(f"Столбец '{column}' не существует в модели Vacancy")

    # Проверяем тип элемента массива
    item_type = column_attr.type.item_type
    print(f"Type of column: {type(item_type)}")  # Печатаем тип элемента массива

    # Если тип элемента массива — String (VARCHAR или TEXT)
    if isinstance(item_type, String):
        # Обрабатываем операторы для строковых элементов в массиве
        operators = {
            "=": lambda value: column_attr.any(value),  # Проверяем наличие строки в массиве
            "!=": lambda value: ~column_attr.any(value),  # Проверяем отсутствие строки в массиве
            "==": lambda value: func.array_to_string(column_attr, ',').ilike(f"%{value}%")  # Нечувствительное сравнение подстроки
        }
    else:
        print("Not a String array")
        # Обрабатываем обычные операторы для других типов
        operators = {
            "=": lambda value: column_attr.any(value),  # Проверяем наличие элемента в массиве
            "!=": lambda value: ~column_attr.any(value)  # Проверяем отсутствие элемента в массиве
        }

    if operator not in operators:
        raise ValueError(f"Оператор '{operator}' не поддерживается для массива")

    # Преобразуем значения в соответствующие фильтры
    conditions = [operators[operator](value) for value in values]

    # Логическое объединение (OR или AND)
    if separator == "or":
        condition = or_(*conditions)  # OR
    else:
        condition = and_(*conditions)  # AND

    return query.filter(condition)


def apply_compare_filter_for_column_with_one_value(query, column, values, operator, separator):
    column_attr = getattr(Vacancy, column, None)
    if not column_attr:
        raise ValueError(f"Столбец '{column}' не существует в модели Vacancy")

    # Проверка типа столбца
    item_type = column_attr.type
    if isinstance(item_type, String):
        # Для строк добавляем оператор для нечувствительного сравнения подстроки
        operators = {
            ">": lambda value: column_attr > value,
            ">=": lambda value: column_attr >= value,
            "<": lambda value: column_attr < value,
            "<=": lambda value: column_attr <= value,
            "=": lambda value: column_attr == value,
            "!=": lambda value: column_attr != value,
            "==": lambda value: column_attr.ilike(f"%{value}%"),  # Нечувствительное сравнение подстроки
        }
    elif isinstance(item_type, DateTime):
        # Для столбцов типа DateTime преобразуем строку в datetime и сравниваем только дату
        operators = {
            ">": lambda value: cast(column_attr, Date) > datetime.strptime(value, "%Y-%m-%d").date(),
            ">=": lambda value: cast(column_attr, Date) >= datetime.strptime(value, "%Y-%m-%d").date(),
            "<": lambda value: cast(column_attr, Date) < datetime.strptime(value, "%Y-%m-%d").date(),
            "<=": lambda value: cast(column_attr, Date) <= datetime.strptime(value, "%Y-%m-%d").date(),
            "=": lambda value: cast(column_attr, Date) == datetime.strptime(value, "%Y-%m-%d").date(),
            "!=": lambda value: cast(column_attr, Date) != datetime.strptime(value, "%Y-%m-%d").date(),
        }
    else:
        # Для других типов столбцов
        operators = {
            ">": lambda value: column_attr > value,
            ">=": lambda value: column_attr >= value,
            "<": lambda value: column_attr < value,
            "<=": lambda value: column_attr <= value,
            "=": lambda value: column_attr == value,
            "!=": lambda value: column_attr != value,
        }

    if operator not in operators:
        raise ValueError(f"Оператор '{operator}' не поддерживается")

    # Преобразуем значения в соответствующие фильтры
    conditions = [operators[operator](value) for value in values]

    # Логическое объединение (OR или AND)
    if separator == "or":
        condition = or_(*conditions)  # OR
    else:
        condition = and_(*conditions)  # AND

    return query.filter(condition)


# Парсит строку фильтров
def parse_filters(filters):
    """

    :param filters: "salary_to>=and:50000~60000~70000;min_experience<or:3~5~7;title=or:Data~Analyst~Scientist"
    :return:
    {
    'salary_to': ('>=', ['50000', '60000', '70000'], 'and'),
    'min_experience': ('<', ['3', '5', '7'], 'or'),
    'title': ('=', ['Data', 'Analyst', 'Scientist'], 'or')
    }

    """
    result = {}
    if not filters:
        return result  # Если пустая строка, возвращаем пустой словарь

    # Разбиваем фильтры по `;`, чтобы разделить разные фильтры
    filter_parts = filters.split(";")

    # Регулярка для парсинга "столбец оператор и префикс (and|or) значения"
    pattern = re.compile(r"^\s*([^=!<>]+)\s*([=!<>]+)\s*(and:|or:)?(.*)$")

    for part in filter_parts:
        match = pattern.match(part)
        if not match:
            continue  # Если часть не совпала с шаблоном, пропускаем

        column, operator, logical_prefix, values_str = match.groups()
        column, operator = column.strip(), operator.strip()
        values_str = values_str.strip()

        # Если есть префикс (and: или or:), то используем его для определения логического оператора
        if logical_prefix:
            separator = logical_prefix[:-1]  # Убираем двоеточие (and: или or:)
            values = values_str.split("~")  # Разделяем значения внутри фильтра по "~"
            result[column] = (operator, [v.strip() for v in values], separator)
        else:
            # Разделяем значения внутри фильтра по "~"
            values = values_str.split("~")
            separator = "and"  # По умолчанию логический оператор "and"
            result[column] = (operator, [v.strip() for v in values], separator)

    return result


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


# Добавление столбцов в результат
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


@router.get("/table/")
def get_vacancies_main_table(
        specific_fields: str = Query(None, description="Выбор выводимых полей"),
        filters: str = Query(None, description="Фильтры для полей"),
        group_by: str = Query(None, description="Поле для группировки"),
        aggregates: str = Query(None, description="Агрегаты (например, 'salary_to:AVG,salary_from:SUM')"),
        not_null: str = Query(None, description="Столбцы, которые должны быть со значениями"),
        sort_by: str = Query(None, description="Сортировка по полю (например, 'salary_from:asc' или 'title:desc')"),
        limit: int = Query(15, ge=1, le=100, description="Количество вакансий для отображения (максимум 100)"),
        offset: int = Query(0, description="Смещение для пагинации"),
        db: Session = Depends(get_db)
):
    query = db.query(Vacancy)

    # Обработка specific_fields (если нужно вернуть только определенные поля)
    if specific_fields and (not (group_by)):
        fields = specific_fields.split(",")  # Пример: "salary_from,salary_to"
        if "url" not in fields:
            fields.append("url")
        query = add_columns_to_result(query, fields)

    columns_with_one_value = ["id", "title", "company_name", "currency", "experience", "type_of_employment",
                              "work_format", "description", "address", "published_at", "archived", "url",
                              "min_experience", "max_experience",
                              "salary_to", "salary_from", "bonus",
                              ]

    # Обработка фильтров
    if filters:
        tuple_of_filters = parse_filters(filters)
        for column, value in tuple_of_filters.items():
            if len(value) == 3:
                if column in columns_with_one_value:
                    print(column, value[1], value[0], value[2])
                    query = apply_compare_filter_for_column_with_one_value(query, column, value[1], value[0], value[2])
                else:
                    print(column, value[1], value[0], value[2])
                    query = apply_compare_filter_for_array_column(query, column, value[1], value[0], value[2])

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
