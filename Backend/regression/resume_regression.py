from regression import dataframe_functions, constants
import pandas as pd
import numpy as np
import re
from regression import constants

def clean_params(params_str):
    if isinstance(params_str, list):
        return [s.strip().strip('"') for s in params_str if s and str(s).strip()]

    if not isinstance(params_str, str):
        return []

    params_str = params_str.strip('{}')
    params = re.findall(r'(?:[^,"]|"(?:\\.|[^"])*")+', params_str)
    params = [s.strip().strip('"') for s in params if s.strip()]
    return params


def prepare_df_for_resume_model():
    df = dataframe_functions.load_table("resume")
    df = df.dropna(subset=['russian_salary'])

    df = df.drop(columns=[
        'id_resume', 'created_at', 'updated_at', 'currency', 'salary',
        'url', 'title', 'professional_roles', 'citizenship'
    ])

    language_levels = {'a1': 1, 'a2': 2, 'b1': 3, 'b2': 4, 'c1': 5, 'c2': 6, 'l1': 7}
    df['language_eng_encoded'] = df['language_eng'].map(language_levels).fillna(0).astype(int)

    df = df.drop(columns=[
        'language_zho', 'language_eng'
    ])
    df = df.dropna(subset=['age', 'total_experience', 'language_eng_encoded'])

    df["has_driver_license"] = df["is_driver"].astype(int)

    df = df.drop(columns=[
        'is_driver', 'photo'
    ])
    df = df.rename(columns={
        "has_driver_license": "is_driver",
        'language_eng_encoded': 'language_eng'
    })

    df = pd.get_dummies(df, columns=['gender'], dtype=int)
    df.head()

    top_area = df['area'].value_counts().head(5).index
    df['area_group'] = df['area'].apply(lambda x: x if x in top_area else 'other')
    df = pd.get_dummies(df, columns=['area_group'], prefix='area', dtype=int)
    df = df.drop(columns=['area'])

    df['skills_cleaned'] = df['skill_set'].apply(clean_params)

    selected_skills = [
        'MS Excel',
        'Работа с большим объемом информации',
        'Аналитическое мышление',
        'SQL',
        'MS PowerPoint',
        'Python',
        'BPMN',
        'Бизнес-анализ',
        'Разработка технических заданий',
        'Atlassian Jira',
        'Постановка задач разработчикам',
        'Системный анализ',
        'UML',
        'Power BI',
        'Atlassian Confluence',
        'Моделирование бизнес процессов',
        'Финансовый анализ',
        'MS SQL',
        'PostgreSQL',
        'Power Query',
        'MS Visio',
        'Статистический анализ',
        'Экономический анализ',
        'Управленческая отчетность',
        'Автоматизация процессов',
        'Визуализация данных',
        'Git',
        'Оптимизация бизнес-процессов',
        'Прогнозирование',
        'Анализ бизнес показателей',
        'Анализ финансовых показателей',
        '1С: Предприятие 8'
    ]

    for skill in selected_skills:
        df[f'skill_{skill}'] = df['skills_cleaned'].apply(lambda x: 1 if skill in x else 0)

    df = df.drop(columns=['skill_set', 'skills_cleaned'])

    df['schedules_cleaned'] = df['schedules'].apply(clean_params)

    selected_schedules = [
        'Полный день',
        'Удаленная работа',
        'Гибкий график',
        'Сменный график',
        'Вахтовый метод'
    ]

    for schedule in selected_schedules:
        df[f'schedules_{schedule}'] = df['schedules_cleaned'].apply(lambda x: 1 if schedule in x else 0)

    df = df.drop(columns=['schedules', 'schedules_cleaned'])

    education_levels = {
        'Среднее': 1,
        'Среднее специальное': 2,
        'Неоконченное высшее': 3,
        'Incomplete higher': 3,
        'Бакалавр': 4,
        'Высшее': 4,
        'Bachelor': 4,
        'Higher': 4,  # Предполагаем, что это эквивалент бакалавра
        'Магистр': 5,
        'Master': 5,
        'Кандидат наук': 6,
        'PhD': 6,
        'Доктор наук': 7
    }

    # Применяем преобразование
    df['education_level'] = df['level_education'].map(education_levels)

    df = df.drop(columns=[
        'level_education'
    ])
    df = df.rename(columns={
        "education_level": "level_education"
    })

    df['experience_cleaned'] = df['experience'].apply(clean_params)

    selected_experience = [
        'Сбер',
        'Индивидуальное предпринимательство / частная практика / фриланс',
        'Розничная сеть',
        'Магнит',
        'Банк ВТБ',
        'Т-Банк',
        'Группа компаний',
        'Яндекс',
        'Ростелеком',
        'МТС',
        'Альфа-Банк',
        'Росбанк',
        'Россельхозбанк',
        'Ozon',
        'Билайн',
        'Интернет-магазин',
        'Тинькофф Банк',
        'Пепсико Россия',
        'РЖД',
        'НИУ ВШЭ',
        'Промсвязьбанк',
        'EY Russia',
        'Газпромбанк',
        'Raiffeisenbank',
        'X5 Retail Group',
        'Совкомбанк',
        'ФК Открытие',
        'ЦБ РФ',
        'МегаФон',
        'Банк Уралсиб',
        'Яндекс Практикум',
        'Почта России',
        'Philip Morris International',
        'VK',
        'Иннотех',
        'Банк Хоум Кредит',
        'Wildberries',
        'Аэропорт Домодедово',
        'Tele2',
        'Лента'
    ]

    for experience in selected_experience:
        df[f'experience_{experience}'] = df['experience_cleaned'].apply(lambda x: 1 if experience in x else 0)

    df = df.drop(columns=['experience', 'experience_cleaned'])

    df['employments_cleaned'] = df['employments'].apply(clean_params)

    selected_employments = [
        'Полная занятость',
        'Частичная занятость',
        'Проектная работа',
        'Стажировка'
    ]

    for employments in selected_employments:
        df[f'employments_{employments}'] = df['employments_cleaned'].apply(lambda x: 1 if employments in x else 0)

    df = df.drop(columns=['employments', 'employments_cleaned'])

    df['university_cleaned'] = df['university'].apply(clean_params)

    selected_university = [
        "Финансовый университет при Правительстве Российской Федерации",
        "Национальный исследовательский университет 'Высшая школа экономики'",
        "Московский государственный университет им. М.В. Ломоносова",
        "Российский экономический университет им. Г.В. Плеханова",
        "Российская академия народного хозяйства и государственной службы при Президенте РФ",
        "Санкт-Петербургский государственный университет",
        "Московский авиационный институт (национальный исследовательский университет)",
        "Московский государственный технический университет им. Н.Э. Баумана",
        "Московский физико-технический институт (Государственный университет)",
        "Уральский федеральный университет имени первого Президента России Б.Н. Ельцина",
        "Национальный исследовательский ядерный университет 'МИФИ'",
        "Государственный университет управления",
        "Кубанский государственный университет",
        "Казанский (Приволжский) федеральный университет",
        "Санкт-Петербургский политехнический университет Петра Великого",
        "Воронежский государственный университет",
        "Российский государственный университет нефти и газа им. И.М. Губкина",
        "Московский энергетический институт (Национальный исследовательский университет)",
        "Российский университет дружбы народов"
    ]

    for university in selected_university:
        df[f'university_{university}'] = df['university_cleaned'].apply(lambda x: 1 if university in x else 0)

    df = df.drop(columns=['university', 'university_cleaned'])

    salary_q = df['russian_salary'].quantile(0.99)
    df = df[df['russian_salary'] <= salary_q]

    for column in df.columns:
        # Для числовых столбцов
        if pd.api.types.is_numeric_dtype(df[column]):
            median_val = df[column].median()
            df[column] = df[column].fillna(median_val)

        # Для категориальных/строковых
        elif pd.api.types.is_string_dtype(df[column]) or pd.api.types.is_object_dtype(df[column]):
            mode_val = df[column].mode()[0]  # берем первое самое частое значение
            df[column] = df[column].fillna(mode_val)

    return df

def get_structure_for_resume(params):
    # Формируем структурированный ответ
    structure = {
        "total_experience": {
            "type": "number",
            "single": True,
            "default": 0,
            "description": "Опыт работы в месяцах"
        },
        "count_additional_courses": {
            "type": "number",
            "single": True,
            "default": 0,
            "description": "Кол-во доп. курсов"
        },
        "language_eng": {
            "type": "number",
            "single": True,
            "default": 0,
            "description": "Уровень английского языка"
        },
        "is_driver": {
            "type": "number",
            "single": True,
            "default": 0,
            "description": "Есть ли водит. удостоверение"
        },
        "gender": {
            "options": [],
            "single": True,
            "default": "male",
            "description": "Пол"
        },
        "area": {
            "options": [],
            "single": True,
            "default": "Москва",
            "description": "Город проживания"
        },
        "skill": {
            "options": [],
            "single": False,
            "description": "Навыки"
        },
        "schedules": {
            "options": [],
            "single": False,
            "description": "График работы"
        },
        "experience": {
            "options": [],
            "single": False,
            "description": "Где работал"
        },
        "employments": {
            "options": [],
            "single": False,
            "description": "Тип занятости"
        },
        "university": {
            "options": [],
            "single": False,
            "description": "Законченные университеты"
        }
    }

    for param in params:
        if param.startswith("gender_"):
            value = param.replace("gender_", "")
            structure["gender"]["options"].append(value)
        if param.startswith("area_"):
            value = param.replace("area_", "")
            structure["area"]["options"].append(value)
        if param.startswith("skill_"):
            value = param.replace("skill_", "")
            structure["skill"]["options"].append(value)
        if param.startswith("schedules_"):
            value = param.replace("schedules_", "")
            structure["schedules"]["options"].append(value)
        if param.startswith("experience_"):
            value = param.replace("experience_", "")
            structure["experience"]["options"].append(value)
        if param.startswith("employments_"):
            value = param.replace("employments_", "")
            structure["employments"]["options"].append(value)
        if param.startswith("university_"):
            value = param.replace("university_", "")
            structure["university"]["options"].append(value)

    return {
        "base_model": "vacancies",
        "structure": structure
    }
