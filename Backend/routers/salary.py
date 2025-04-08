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
        type_of_employment: str = Body(None),
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
        if type_of_employment and type_of_employment != "Полная занятость":
            prediction_params[f"type_of_employment_{type_of_employment}"] = 1

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

@router.post("/resume_salary/")
async def predict_resume_salary(
        total_experience: float = Body(..., embed=True),
        count_additional_courses: float = Body(..., embed=True),
        language_eng: float = Body(..., embed=True),
        is_driver: float = Body(..., embed=True),
        gender: str = Body(None),
        skill: Dict[str, bool] = Body({}),
        schedules: Dict[str, bool] = Body({}),
        experience: Dict[str, bool] = Body({}),
        employments: Dict[str, bool] = Body({}),
        university: Dict[str, bool] = Body({}),
        area: str = Body(None),
):
    try:
        # Преобразуем параметры в формат модели
        prediction_params = {
            "total_experience": total_experience,
            "count_additional_courses": count_additional_courses,
            "language_eng": language_eng,
            "is_driver": is_driver
        }

        # Обрабатываем категориальные признаки
        if gender and gender != "male":
            prediction_params[f"gender_{gender}"] = 1

        if area and area != "Москва":
            prediction_params[f"area_{area}"] = 1

        # Обрабатываем списки
        for skil, enabled in skill.items():
            if enabled:
                prediction_params[f"skill_{skil}"] = 1

        for schedule, enabled in schedules.items():
            if enabled:
                prediction_params[f"schedules_{schedule}"] = 1

        for exp, enabled in experience.items():
            if enabled:
                prediction_params[f"experience_{exp}"] = 1

        for uni, enabled in university.items():
            if enabled:
                prediction_params[f"university_{uni}"] = 1

        for emp, enabled in employments.items():
            if enabled:
                prediction_params[f"employments_{emp}"] = 1

        # Получаем модель и делаем предсказание
        model = regression_functions.get_model("resume")
        salary = regression_functions.predict_salary(
            model=model,
            base_model="resume",
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