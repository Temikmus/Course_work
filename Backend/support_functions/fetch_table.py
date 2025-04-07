from sqlalchemy.orm import Session
from support_functions import sql_functions
from typing import Type
from database.models import Base


def fetch_table_data(
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
    base_model: Type[Base] = None
):
    """Основная логика получения данных, которую можно вызывать и из API, и из других функций."""
    query = db.query(base_model)

    if specific_fields and (not group_by):
        fields = specific_fields.split(",")
        if "url" not in fields:
            fields.append("url")
        query = sql_functions.add_columns_to_result(query, fields, base_model)

    if filters:
        tuple_of_filters = sql_functions.parse_filters(filters)
        for column, value in tuple_of_filters.items():
            if len(value) == 3:
                query = sql_functions.apply_filter_for_column(query, column, value[1], value[0], value[2], base_model)
            else:
                raise ValueError(f"Неправильный фильтр: {column}:{value}")

    group_columns = sql_functions.find_group_columns(group_by, base_model)
    selected_aggregates = sql_functions.find_aggregate_columns_for_group_by(aggregates, base_model)
    query = sql_functions.apply_group_by(query, group_columns, selected_aggregates)
    query = sql_functions.apply_sorting_of_table(query, group_columns, selected_aggregates, sort_by, base_model)
    query = sql_functions.apply_not_null_for_columns(query, not_null, base_model)

    if group_by and having:
        query = sql_functions.apply_having(query, having, selected_aggregates, base_model)

    total_count = query.count()

    if offset:
        query = query.offset(offset)
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