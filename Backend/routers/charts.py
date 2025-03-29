from fastapi import APIRouter, Depends, Query, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import func, and_
from database import get_db
from models import Vacancy, Resume
from typing import Union
import sql_functions
from routers.vacancies_table import fetch_vacancies_data
from routers.resumes_table import fetch_resumes_data

router = APIRouter()

@router.get("/column-count/")
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
                             sort_by=f'{column}:count:desc')
    elif model == "resume":
        result = fetch_resumes_data(db=db,filters=filters, group_by=column, aggregates=f'{column}:count',
                             sort_by=f'{column}:count:desc')
    else:
        raise HTTPException(status_code=400, detail="Неподдерживаемая модель")

    labels = []
    values = []
    for item in result['results']:
        labels.append(str(item[column]))
        values.append(str(item[f'{column}_count']))
    return {
        "chart_type": chart_type,
        "limit": limit,
        "total_count": result['total_count'],
        "data": {
            "labels": labels,
            "values": values,
            "column": column
        }
    }



