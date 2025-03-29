import re
from fastapi import APIRouter, Depends, Query, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import func, and_, or_, cast, case, nulls_last
from database import SessionLocal
from datetime import datetime
from sqlalchemy.dialects.postgresql import ARRAY, VARCHAR
from sqlalchemy.types import String, DateTime, Date, ARRAY
from sqlalchemy.sql.functions import percentile_cont
from sqlalchemy.sql.expression import select
import logging
from sqlalchemy.orm import aliased
from sqlalchemy.sql import func, select, column, table, text



# Разбор строки having (например, 'salary_to:avg>50000~id:count>2')
def parse_having(having_str):
    """
    Преобразует строку HAVING в словарь.
    Пример:
        Вход: "salary_from:avg>50000;id:count<100"
        Выход: { "salary_from": ("avg", ">", "50000"), "id": ("count", "<", "100") }
    """
    having_conditions = {}

    if not having_str:
        return having_conditions

    conditions = having_str.split("~")
    pattern = re.compile(r"^(\w+):(\w+)([><=!]+)(.+)$")

    for condition in conditions:
        match = pattern.match(condition.strip())
        if not match:
            raise HTTPException(status_code=400, detail=f"Некорректный формат HAVING: '{condition}'")

        column, agg_func, operator, value = match.groups()
        having_conditions[column] = (agg_func.lower(), operator, value.strip())

    return having_conditions



aggregate_funcs = {
    "avg": func.avg,  # Среднее значение
    "sum": func.sum,  # Сумма
    "max": func.max,  # Максимальное значение
    "min": func.min,  # Минимальное значение
    "count": func.count,  # Подсчет элементов
    "median": lambda col: func.percentile_cont(0.5).within_group(col),  # Медиана
    "stddev": func.stddev,  # Стандартное отклонение
    "variance": func.variance,  # Дисперсия
    "distinct_count": func.count(distinct=True),  # Количество уникальных значений
    "mode": lambda col: func.mode().within_group(col),  # Мода
}

# Применяем HAVING после группировки
def apply_having(query, having_str, aggregate_columns, vacancy_model):
    """
    Применяет HAVING-фильтрацию к агрегированным данным.
    """
    having_conditions = parse_having(having_str)

    having_filters = []
    for column, (agg_func, operator, value) in having_conditions.items():
        column_attr = getattr(vacancy_model, column, None)
        if not column_attr or agg_func not in aggregate_funcs:
            raise HTTPException(status_code=400, detail=f"Некорректный HAVING '{column}:{agg_func}{operator}{value}'")

        # Определяем агрегированную колонку
        agg_column = aggregate_funcs[agg_func](column_attr)

        # Проверяем оператор
        operators = {
            ">": agg_column > value,
            ">=": agg_column >= value,
            "<": agg_column < value,
            "<=": agg_column <= value,
            "=": agg_column == value,
            "!=": agg_column != value,
        }

        if operator not in operators:
            raise HTTPException(status_code=400, detail=f"Оператор '{operator}' не поддерживается")

        having_filters.append(operators[operator])

    if having_filters:
        query = query.having(and_(*having_filters))

    return query



# Добавление столбцов в результат (столбцы, которые будут в таблице при выводе)
def add_columns_to_result(query, fields, base_model):
    selected_columns = []
    for field in fields:
        if hasattr(base_model, field):
            selected_columns.append(getattr(base_model, field))
        else:
            raise HTTPException(status_code=400, detail=f"Поле '{field}' не существует")
    if selected_columns:
        query = query.with_entities(*selected_columns)
    return query

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

    "salary_to>avg~salary_to"
    {'salary_to': ('>', ['avg', 'salary_to'], 'and')}
    """
    result = {}
    if not filters:
        return result  # Если пустая строка, возвращаем пустой словарь
    try:
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
    except Exception as e:
        logging.error(f"Error parse: '{e}")
        raise




# Функция для выполнения агрегации и получения одного значения


def find_aggregate_value(query: Query, column_name: str, aggregate_func: str, base_model):
    """
    Применяет агрегирующую функцию к указанному столбцу.

    :param query: Исходный объект SQLAlchemy Query.
    :param column_name: Имя столбца (например, "skills").
    :param aggregate_func: Агрегирующая функция (например, "mode").
    :param base_model: SQLAlchemy модель.
    :return: Результат агрегации или None.
    """
    # Получаем атрибут столбца из модели
    column_attr = getattr(base_model, column_name, None)
    if column_attr is None:
        raise ValueError(f"Столбец '{column_name}' не существует в модели {base_model.__name__}.")

    print("\n\n\n1:", "\n\n\n\n")

    # Проверяем, поддерживается ли агрегатная функция
    if aggregate_func not in aggregate_funcs and aggregate_func != "mode":
        raise ValueError(f"Агрегирующая функция '{aggregate_func}' не поддерживается.")

    # Проверяем, является ли столбец массивом
    if isinstance(column_attr.type, ARRAY):
        print("\n\n\n2:", "\n\n\n\n")

        # Подзапрос для развертывания массива с исключением пустых значений
        subquery = (
            query.session.query(func.unnest(column_attr).label("value"))
            .filter(func.array_length(column_attr, 1) > 0)  # Игнорируем пустые массивы
            .subquery()
        )

        # Если агрегатная функция — mode
        if aggregate_func == "mode":
            agg_func = func.mode().within_group(subquery.c.value)
        else:
            agg_func = aggregate_funcs[aggregate_func](subquery.c.value)

    else:
        # Для обычных столбцов применяем стандартную агрегацию
        agg_func = aggregate_funcs[aggregate_func](column_attr)

    print("\n\n\nAGG FUNC:", agg_func, "\n\n\n")

    try:
        # Выполняем запрос
        result = query.session.query(agg_func).scalar()
        print("\n\n\nRESULT:", result, "\n\n\n")
        return result
    except Exception as e:
        print(f"\n\n\nERROR: {e}\n\n\n")
        return None

def apply_compare_filter_for_column_with_one_value(query: Query, column: str, values, operator: str, separator: str,
                                                   base_model):
    column_attr = getattr(base_model, column, None)
    if not column_attr:
        raise ValueError(f"Столбец '{column}' не существует в модели Vacancy")
    try:
        # Проверка типа столбца
        if len(values) == 2:
            if values[0] in aggregate_funcs:
                values = [find_aggregate_value(query, values[1], values[0], base_model)]
                print(values)

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
                ">": lambda value: cast(column_attr, Date) > value.date() if isinstance(value, datetime) else cast(
                    column_attr, Date) > datetime.strptime(value, "%Y-%m-%d").date(),
                ">=": lambda value: cast(column_attr, Date) >= value.date() if isinstance(value, datetime) else cast(
                    column_attr, Date) >= datetime.strptime(value, "%Y-%m-%d").date(),
                "<": lambda value: cast(column_attr, Date) < value.date() if isinstance(value, datetime) else cast(
                    column_attr, Date) < datetime.strptime(value, "%Y-%m-%d").date(),
                "<=": lambda value: cast(column_attr, Date) <= value.date() if isinstance(value, datetime) else cast(
                    column_attr, Date) <= datetime.strptime(value, "%Y-%m-%d").date(),
                "=": lambda value: cast(column_attr, Date) == value.date() if isinstance(value, datetime) else cast(
                    column_attr, Date) == datetime.strptime(value, "%Y-%m-%d").date(),
                "!=": lambda value: cast(column_attr, Date) != value.date() if isinstance(value, datetime) else cast(
                    column_attr, Date) != datetime.strptime(value, "%Y-%m-%d").date(),
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
    except Exception as e:
        logging.error(f"One value: '{e}")
        raise


# Применяем фильтр для столбца типа array, так как там идет проверка для каждого элемента массива:
# если для какого-то элемента выполняется условие, то эта строка добавляется к выводу
# (например, skills=sql выведет все строки, где есть в skills sql)
def apply_compare_filter_for_array_column(query: Query, column: str, values, operator: str, separator: str, base_model):
    column_attr = getattr(base_model, column, None)
    if not column_attr:
        raise ValueError(f"Столбец '{column}' не существует в модели Vacancy")
    try:
        # Проверка типа столбца
        if len(values) == 2:
            if values[0] in aggregate_funcs:
                values = [find_aggregate_value(query, values[1], values[0], base_model)]
                print(values)

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
    except Exception as e:
        logging.error(f"Error array_column: '{e}")
        raise

def apply_filter_for_column(query: Query, column: str, values, operator: str, separator: str, base_model):
    column_model = getattr(base_model, column)
    if isinstance(column_model.type, ARRAY):
        query = apply_compare_filter_for_array_column(query, column, values, operator, separator, base_model)
    else:
        query = apply_compare_filter_for_column_with_one_value(query, column, values, operator, separator, base_model)
    return query



# Добавляем в массив стобцы, по которым будет произведена группировка, причем
# если этот столбец - массив, то он разбивается по значениям в массиве (например, группировка по skills:)
# выдаст столбец в котором по скиллам идет разветвление
def find_group_columns(group_by, base_model):
    group_columns = []
    if group_by:
        group_fields = group_by.split(",")
        for field in group_fields:
            column_attr = getattr(base_model, field, None)
            if not column_attr:
                raise HTTPException(status_code=400, detail=f"Поле '{field}' не найдено для группировки")
            # 🔹 Отладочный вывод
            print(f"Обрабатываем поле {field}: {column_attr.type}")
            # Проверяем, является ли поле массивом
            if isinstance(column_attr.type, ARRAY):
                print(f"🔹 Поле {field} является массивом. Применяем `unnest()`.")
                unnest_column = func.unnest(column_attr).label(field)
                group_columns.append(unnest_column)
            else:
                print(f"🔸 Поле {field} НЕ массив.")
                group_columns.append(column_attr)
    return group_columns


def find_aggregate_columns_for_group_by(aggregates, base_model):
    selected_aggregates = []
    if aggregates:
        agg_fields = aggregates.split(",")
        for agg in agg_fields:
            field, agg_type = agg.split(":")
            column_attr = getattr(base_model, field, None)
            if column_attr and agg_type in aggregate_funcs:
                selected_aggregates.append(aggregate_funcs[agg_type](column_attr).label(f"{field}_{agg_type}"))
            else:
                raise HTTPException(status_code=400, detail=f"Некорректный агрегат '{agg}'")
    return selected_aggregates

def apply_group_by(query, group_columns,selected_aggregates):
    # Если есть группировка и агрегаты, объединяем
    if group_columns and selected_aggregates:
        query = query.with_entities(*group_columns, *selected_aggregates).group_by(*group_columns)
    elif group_columns:
        query = query.with_entities(*group_columns).group_by(*group_columns)
    elif selected_aggregates:
        query = query.with_entities(*selected_aggregates)
    return query

def apply_sorting_of_table(query, group_columns, selected_aggregates, sort_by, base_model):
    try:
        if sort_by:
            sort_fields = sort_by.split(",")
            sort_expressions = []

            for sort in sort_fields:
                parts = sort.split(":")
                if len(parts) == 2:  # Обычная сортировка
                    field, order = parts

                    if not hasattr(base_model, field):
                        raise HTTPException(status_code=400, detail=f"Поле '{field}' не найдено для сортировки")

                    column = getattr(base_model, field)

                    if isinstance(column.property.columns[0].type, ARRAY):
                        # Если это массив, разворачиваем с unnest()
                        unnest_column = func.unnest(column).label(field)
                        group_columns.append(unnest_column)
                        sort_expressions.append(nulls_last(unnest_column.desc() if order == "desc" else unnest_column.asc()))
                    else:
                        # Применяем NULLS LAST для сортировки по обычным полям
                        sort_expressions.append(nulls_last(column.desc() if order == "desc" else column.asc()))

                elif len(parts) == 3:  # Агрегатная сортировка (например, salary:avg:desc)
                    field, agg_type, order = parts
                    agg_label = f"{field}_{agg_type}"
                    matching_aggregates = [agg for agg in selected_aggregates if agg.key == agg_label]

                    if not matching_aggregates:
                        raise HTTPException(status_code=400, detail=f"Агрегат '{agg_label}' не найден")

                    column = matching_aggregates[0]
                    sort_expressions.append(nulls_last(column.desc() if order == "desc" else column.asc()))

                else:
                    raise HTTPException(status_code=400, detail=f"Некорректный формат сортировки: '{sort}'")

            query = query.order_by(*sort_expressions)

        if group_columns:
            query = query.group_by(*group_columns)

        return query
    except Exception as e:
        logging.error(f"Error in sorting or grouping: {str(e)}")
        raise HTTPException(status_code=500, detail="Internal Server Error")



def apply_not_null_for_columns(query, not_null_columns, base_model):
    if not_null_columns:
        not_null_columns = not_null_columns.split(",")
        for column in not_null_columns:
            if hasattr(base_model, column):
                # Получаем атрибут столбца из модели
                column_attr = getattr(base_model, column)
                # Фильтруем, чтобы значение не было None и не было пустым списком
                query = query.filter(column_attr.isnot(None))  # Значение не равно None

                if isinstance(column_attr.property.columns[0].type, ARRAY):
                    # Если это массив, то он не должен быть равен []
                    query = query.filter(func.array_length(column_attr, 1) > 0)
            else:
                raise HTTPException(status_code=400, detail=f"Поле '{column}' не существует.")
    return query