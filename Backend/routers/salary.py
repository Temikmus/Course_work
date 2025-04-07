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


@router.post("/vacancies_salary/")
async def predict_vacancy_salary(
        min_experience: float = Body(..., embed=True),
        type_format: str = Body(None),
        work_format: str = Body(None),
        skills: Dict[str, bool] = Body({}),
        address: str = Body(None),
):
    try:
        # Преобразуем параметры в формат модели
        prediction_params = {
            "min_experience": min_experience
        }

        # Обрабатываем категориальные признаки
        if type_format and type_format != "Полная занятость":
            prediction_params[f"type_format_{type_format}"] = 1

        if work_format and work_format != "Удаленная работа":
            prediction_params[f"work_format_{work_format}"] = 1

        if address and address != "Москва":
            prediction_params[f"address_{address}"] = 1

        # Обрабатываем навыки
        for skill, enabled in skills.items():
            if enabled:
                prediction_params[f"skill_{skill}"] = 1

        # Получаем модель и делаем предсказание
        model = regression_functions.get_model("vacancies")
        salary = regression_functions.predict_salary(
            model=model,
            base_model="vacancies",
            **prediction_params
        )

        return {
            "predicted_salary": round(salary, 2),
            "used_parameters": prediction_params
        }

    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Ошибка предсказания: {str(e)}"
        )