from fastapi import APIRouter, HTTPException, Depends, Body
from typing import Dict, Any
from sqlalchemy.orm import Session
import json
from regression import regression_functions, vacancies_regression
from database.db_connection import get_db
from fastapi import APIRouter, HTTPException, Depends, Body, Query
from typing import Dict, Any
from sqlalchemy.orm import Session

router = APIRouter()


@router.get("/model_structure/")
async def get_structure(
        base_model: str = Query(..., description="Модель (vacancies или resume)")
):
    try:
        # Получаем модель и её параметры
        model = regression_functions.get_model(base_model)
        params = model.model.exog_names  # Список всех предикторов

        if base_model=="vacancies":
            return vacancies_regression.get_structure_for_vacancies(params)

    except Exception as e:
        raise HTTPException(
            status_code=400,
            detail=f"Ошибка получения структуры модели: {str(e)}"
        )