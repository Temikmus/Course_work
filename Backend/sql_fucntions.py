import re
from fastapi import APIRouter, Depends, Query, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import func, and_, or_, cast, case
from database import SessionLocal
from datetime import datetime
from sqlalchemy.dialects.postgresql import ARRAY, VARCHAR
from sqlalchemy.types import String, DateTime, Date, ARRAY
from sqlalchemy.sql.functions import percentile_cont
from sqlalchemy.sql.expression import select
import logging


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


# Применяем фильтр для столбца типа array, так как там идет проверка для каждого элемента массива:
# если для какого-то элемента выполняется условие, то эта строка добавляется к выводу
# (например, skills=sql выведет все строки, где есть в skills sql)
def apply_compare_filter_for_array_column(query: Query, column: str, values, operator: str, separator: str, base_model):
    column_attr = getattr(base_model, column, None)
    if not column_attr:
        raise ValueError(f"Столбец '{column}' не существует в модели Vacancy")
    try:
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

#Применяем фильтр для столбца с одним значением
def apply_compare_filter_for_column_with_one_value(query: Query, column: str, values, operator: str, separator: str, base_model):
    column_attr = getattr(base_model, column, None)
    if not column_attr:
        raise ValueError(f"Столбец '{column}' не существует в модели Vacancy")
    try:
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
    except Exception as e:
        logging.error(f"One value: '{e}")
        raise


def apply_filter_for_column(query: Query, column: str, values, operator: str, separator: str, base_model):
    column_model = getattr(base_model, column)
    # Если поле является массивом, добавляем его в GROUP BY
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



# Создаем расширенный словарь агрегатных функций
aggregate_funcs = {
    "avg": func.avg,  # Среднее значение
    "sum": func.sum,  # Сумма
    "max": func.max,  # Максимальное значение
    "min": func.min,  # Минимальное значение
    "count": func.count,  # Подсчет элементов
    "median": lambda col: func.percentile_cont(0.5).within_group(col),  # Медиана
    "stddev": func.stddev,  # Стандартное отклонение
    "variance": func.variance,  # Дисперсия
    "group_concat": func.string_agg,  # Конкатенация строк
    "distinct_count": func.count(distinct=True),  # Количество уникальных значений
    "array_agg": func.array_agg,  # Агрегировать в массив
    "mode": lambda col: func.mode().within_group(col),  # Мода
    "first": func.first,  # Первый элемент
    "last": func.last,  # Последний элемент
    "sum_distinct": lambda col: func.sum(func.distinct(col)),  # Сумма уникальных значений
    "corr": func.corr,  # Коэффициент корреляции Пирсона
    "covar_pop": func.covar_pop,  # Совокупная дисперсия
    "covar_samp": func.covar_samp,  # Выборочная дисперсия
    "regr_slope": func.regr_slope,  # Наклон регрессионной линии
    "regr_intercept": func.regr_intercept,  # Перехват регрессионной линии
    "regr_r2": func.regr_r2,  # Коэффициент детерминации
    "rank": func.rank,  # Ранг
    "dense_rank": func.dense_rank,  # Плотный ранг
    "row_number": func.row_number,  # Номер строки
    "ntile": func.ntile,  # Разбиение на N групп
    "json_agg": func.json_agg,  # Агрегировать данные в JSON
    "jsonb_agg": func.jsonb_agg,  # Агрегировать данные в JSONB (PostgreSQL)
    "json_build_object": func.json_build_object,  # Построение JSON-объекта
    "jsonb_build_object": func.jsonb_build_object,  # Построение JSONB-объекта (PostgreSQL)
    "array_length": func.array_length,  # Длина массива
    "array_dims": func.array_dims,  # Размерность массива
    "string_agg": func.string_agg,  # Конкатенация строк с разделителем
    "upper": func.upper,  # Преобразование в верхний регистр
    "lower": func.lower,  # Преобразование в нижний регистр
    "trim": func.trim,  # Удаление пробелов с обеих сторон
    "length": func.length,  # Длина строки
    "concat": func.concat,  # Конкатенация строк
    "now": func.now,  # Текущее время
    "current_timestamp": func.current_timestamp,  # Текущее время (timestamp)
    "date_trunc": func.date_trunc,  # Округление даты
    "age": func.age,  # Разница между датами (возраст)
    "extract": func.extract,  # Извлечение части даты
    "date_part": func.date_part,  # Части даты
    "to_char": func.to_char,  # Преобразование в строку (формат даты/времени)
    "date": func.date,  # Преобразование даты в другой формат
    "to_date": func.to_date,  # Преобразование строки в дату
    "to_timestamp": func.to_timestamp,  # Преобразование строки в timestamp
    "coalesce": func.coalesce,  # Возвращает первый ненулевой аргумент
    "nullif": func.nullif,  # Возвращает null, если два значения равны
}

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
            for sort in sort_fields:
                parts = sort.split(":")
                if len(parts) == 2:  # Обычная сортировка
                    field, order = parts
                    if hasattr(base_model, field):
                        column = getattr(base_model, field)
                        if isinstance(column.type, ARRAY):
                            unnest_column = func.unnest(column).label(field)
                            group_columns.append(unnest_column)
                    else:
                        raise HTTPException(status_code=400, detail=f"Поле '{field}' не найдено для сортировки")
                elif len(parts) == 3:  # Агрегатная сортировка
                    field, agg_type, order = parts
                    agg_label = f"{field}_{agg_type}"
                    matching_aggregates = [agg for agg in selected_aggregates if agg.key == agg_label]
                    if matching_aggregates:
                        column = matching_aggregates[0]
                    else:
                        raise HTTPException(status_code=400, detail=f"Агрегат '{agg_label}' не найден")
                else:
                    raise HTTPException(status_code=400, detail=f"Некорректный формат сортировки: '{sort}'")

                query = query.order_by(column.desc() if order == "desc" else column.asc())

        if group_columns:
            query = query.group_by(*group_columns)

        return query
    except Exception as e:
        logging.error(f"Error in sorting or grouping: {str(e)}")
        raise HTTPException(status_code=500, detail="Internal Server Error")






