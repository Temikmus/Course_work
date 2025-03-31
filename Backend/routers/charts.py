import collections

from fastapi import APIRouter, Depends, Query, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import func, and_
from database import get_db
from models import Vacancy, Resume
from typing import Union
import sql_functions
from routers.vacancies_table import fetch_vacancies_data
from routers.resumes_table import fetch_resumes_data
import statistics
import math
import chart_functions


router = APIRouter()

@router.get("/column_count/")
def get_column_count_chart(
    model: str = Query(..., description="Модель (vacancies или resume)"),
    column: str = Query(..., description="Название столбца для анализа"),
    chart_type: str = Query("bar", description="Тип графика (bar, pie, scatter)"),
    filters: str = Query(None, description="Фильтры как в vacancies"),
    limit: int = Query(10, description="Лимит значений"),
    db: Session = Depends(get_db)
):
    # Выбираем модель
    if model == "vacancies":
        result = fetch_vacancies_data(db=db,filters=filters, group_by=column, aggregates=f'{column}:count',
                             sort_by=f'{column}:count:desc', limit=limit)
    elif model == "resume":
        result = fetch_resumes_data(db=db,filters=filters, group_by=column, aggregates=f'{column}:count',
                             sort_by=f'{column}:count:desc', limit=limit)
    else:
        raise HTTPException(status_code=400, detail="Неподдерживаемая модель")

    labels = []
    values = []
    for item in result['results']:
        labels.append(str(item[column]))
        values.append(str(item[f'{column}_count']))
    return {
        "chart_type": chart_type if chart_type else None,
        "limit": limit if limit else None,
        "total_count": result['total_count'] if result else None,
        "data": {
            "labels": labels if labels else None,
            "values": values if values else None
        },
        "column": column if column else None
    }



@router.get("/time_distribution/")
def get_time_distribution_chart(
    model: str = Query(..., description="Модель (vacancies или resume)"),
    column: str = Query(..., description="Название столбца для анализа"),
    aggregates: str = Query(..., description="Название агрегации: max,min,avg, ..."),
    chart_type: str = Query("bar", description="Тип графика (bar, pie, scatter)"),
    filters: str = Query(None, description="Фильтры как в vacancies"),
    db: Session = Depends(get_db)
):
    limit = 100000000
    # Выбираем модель
    if model == "vacancies":
        time_column = 'published_at'
        result = fetch_vacancies_data(db=db,filters=filters, specific_fields=f'{column},published_at',
                             sort_by=f'published_at:asc', limit=limit, not_null=column)['results']
    elif model == "resume":
        time_column = 'updated_at'
        result = fetch_resumes_data(db=db,filters=filters, specific_fields=f'{column},updated_at',
                             sort_by=f'updated_at:asc', limit=limit, not_null=column)['results']
    else:
        raise HTTPException(status_code=400, detail="Неподдерживаемая модель")

    data = chart_functions.get_data_for_time_distribution(result, column, time_column, aggregates)
    if data is None:
        labels, values, count_values = None, None, None
    else:
        labels, values, count_values = data[0], data[1], data[2]
    return {
        "chart_type": chart_type if chart_type else None,
        "total_count": len(labels) if labels else None,
        "data": {
            "labels": labels if labels else None, # times [{year:2024,month:1},{year:2024,month:2}, ...]
            "values": values if values else None, # salary_avg, skills_mode, ... [30000,33000,34000,...]
            "count_values": count_values if count_values else None # [101,127,105,]
        },
        "column": column if column else None,
        "aggregates": aggregates if aggregates else None
    }


@router.get("/metric_column/")
def get_metric_column_chart(
    model: str = Query(..., description="Модель (vacancies или resume)"),
    metric_column: str = Query(..., description="Столбец с метрическими данными"),
    aggregations: str = Query(..., description="Агрегация для столбца с зарплатой"),
    column: str = Query(..., description="Столбец для сравнения"),
    chart_type: str = Query("bar", description="Тип графика (bar, pie, scatter)"),
    filters: str = Query(None, description="Фильтры как в vacancies"),
    limit: int = Query(10, description="Лимит значений"),
    db: Session = Depends(get_db)
):
    # Выбираем модель
    if model == "vacancies":
        result = fetch_vacancies_data(db=db,filters=filters, group_by=column, aggregates=f'{metric_column}:{aggregations},{column}:count',
                                      sort_by=f'{column}:count:desc', limit=limit, not_null=column)['results']
    elif model == "resume":
        result = fetch_resumes_data(db=db,filters=filters, group_by=column, aggregates=f'{metric_column}:{aggregations},{column}:count',
                                      sort_by=f'{column}:count:desc', limit=limit, not_null=column)['results']
    else:
        raise HTTPException(status_code=400, detail="Неподдерживаемая модель")

    data = chart_functions.get_data_for_metric_column(result, column, metric_column, aggregations)
    if data is None:
        labels, values, count_values = None, None, None
    else:
        labels, values, count_values = data[0], data[1], data[2]
    return {
        "chart_type": chart_type if chart_type else None,
        "total_count": len(labels) if labels else None,
        "limit": limit if limit else None,
        "data": {
            "labels": labels if labels else None,
            "values": values if values else None,
            "count_values": count_values if count_values else None
        },
        "column": column if column else None,
        "metric_column": metric_column if metric_column else None,
        "aggregations": aggregations if aggregations else None
    }


@router.get("/metric_distribution/")
def get_metric_distribution_chart(
    model: str = Query(..., description="Модель (vacancies или resume)"),
    number_range: str = Query(..., description="Количество диапазонов"),
    column: str = Query(..., description="Столбец для распределения по диапазонам"),
    chart_type: str = Query("bar", description="Тип графика (bar, pie, scatter)"),
    filters: str = Query(None, description="Фильтры как в vacancies"),
    db: Session = Depends(get_db)
):
    limit = 100000000
    # Выбираем модель
    if model == "vacancies":
        result = fetch_vacancies_data(db=db,filters=filters, group_by=f'{column}',aggregates=f'{column}:count',
                             sort_by=f'{column}:asc', limit=limit, not_null=column)['results']
    elif model == "resume":
        result = fetch_resumes_data(db=db,filters=filters, group_by=f'{column}',aggregates=f'{column}:count',
                             sort_by=f'{column}:asc', limit=limit, not_null=column)['results']
    else:
        raise HTTPException(status_code=400, detail="Неподдерживаемая модель")

    data = chart_functions.get_data_for_metric_distribution(result, column, int(number_range))
    if data is None:
        labels, values = None, None
    else:
        labels, values = data[0], data[1]
    return {
        "chart_type": chart_type if chart_type else None,
        "total_count": len(labels) if labels else None,
        "data": {
            "labels": labels if labels else None,
            "values": values if values else None
        },
        "column": column if column else None
    }





