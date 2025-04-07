from regression import dataframe_functions, constants
import pandas as pd
import numpy as np
import re


def clean_skills(skill_str):
    # Если skill_str уже список — возвращаем как есть (предварительно почистив элементы)
    if isinstance(skill_str, list):
        return [s.strip().strip('"') for s in skill_str if s and str(s).strip()]

    # Если skill_str — не строка (например, None или число), возвращаем пустой список
    if not isinstance(skill_str, str):
        return []

    # Чистим строки формата {"", "", ...}
    skill_str = skill_str.strip('{}')
    skills = re.findall(r'(?:[^,"]|"(?:\\.|[^"])*")+', skill_str)
    skills = [s.strip().strip('"') for s in skills if s.strip()]
    return skills
def prepare_df_for_vacancies_model():
    df = dataframe_functions.load_table("vacancies")
    df['salary'] = np.where(
        df['russian_salary_from'].notna() & df['russian_salary_to'].notna(),
        (df['russian_salary_from'] + df['russian_salary_to']) / 2,
        np.where(
            df['russian_salary_from'].notna(),
            df['russian_salary_from'],
            df['russian_salary_to']
        )
    )
    df = df.dropna(subset=['salary'])

    df['type_of_employment'] = df['type_of_employment'].replace('Частичная занятость', 'Другое')
    df['type_of_employment'] = df['type_of_employment'].replace('Проектная работа', 'Другое')
    df['type_of_employment'] = df['type_of_employment'].replace('Стажировка', 'Другое')
    df['type_of_employment'].value_counts()

    df['work_format'] = df['work_format'].replace('Сменный график', 'Гибкий график')
    df = df[df['work_format'] != 'Вахтовый метод']
    df['work_format'].value_counts()

    df = pd.get_dummies(df, columns=['type_of_employment', 'work_format'], dtype=int)

    df['skills_cleaned'] = df['skills'].apply(clean_skills)

    selected_skills = constants.selected_vacancies_skills.copy()

    for skill in selected_skills:
        df[f'skill_{skill}'] = df['skills_cleaned'].apply(lambda x: 1 if skill in x else 0)

    top_address = df['address'].value_counts().head(6).index
    df['address_group'] = df['address'].apply(lambda x: x if x in top_address else 'other')
    df = pd.get_dummies(df, columns=['address_group'], prefix='address', dtype=int)
    df = df.drop(columns=['address'])

    df = df.drop(columns=[
        'id', 'company_name', 'currency', 'published_at',
        'archived', 'url', 'salary_to', 'salary_from', 'experience',
        'russian_salary_to', 'russian_salary_from',
        'description', 'title', 'max_experience', 'skills_cleaned', 'skills'
    ])

    return df

def get_structure_for_vacancies(params):
    # Формируем структурированный ответ
    structure = {
        "min_experience": {
            "type": "number",
            "single": True,
            "default": 0,
            "description": "Опыт работы в годах"
        },
        "type_format": {
            "options": [],
            "single": True,
            "default": "Полная занятость",
            "description": "Тип занятости"
        },
        "work_format": {
            "options": [],
            "single": True,
            "default": "Удаленная работа",
            "description": "Формат работы"
        },
        "skills": {
            "options": [],
            "single": False,
            "description": "Навыки"
        },
        "address": {
            "options": [],
            "single": True,
            "default": "Москва",
            "description": "Город"
        }
    }

    # Заполняем опции для категориальных признаков
    for param in params:
        if param.startswith("type_of_employment_"):
            value = param.replace("type_of_employment_", "")
            structure["type_format"]["options"].append(value)
        elif param.startswith("work_format_"):
            value = param.replace("work_format_", "")
            structure["work_format"]["options"].append(value)
        elif param.startswith("skill_"):
            skill = param.replace("skill_", "")
            structure["skills"]["options"].append(skill)
        elif param.startswith("address_"):
            city = param.replace("address_", "")
            structure["address"]["options"].append(city)

    return {
        "base_model": "vacancies",
        "structure": structure
    }


