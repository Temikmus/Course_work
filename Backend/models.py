from sqlalchemy import Column, Integer, String, Text, DateTime, Boolean, ARRAY, Numeric
from sqlalchemy.ext.declarative import declarative_base

Base = declarative_base()

class Vacancy(Base):
    __tablename__ = "vacancies"

    id = Column(Integer, primary_key=True, index=True)  # Первичный ключ
    title = Column(String)  # Название вакансии
    company_name = Column(String, nullable=True)  # Название компании
    currency = Column(String, nullable=True)  # Валюта
    experience = Column(String, nullable=True)  # Опыт работы
    type_of_employment = Column(String, nullable=True)  # Тип занятости
    work_format = Column(String, nullable=True)  # Формат работы
    skills = Column(ARRAY(String), nullable=True)  # Навыки
    address = Column(String, nullable=True)  # Адрес
    published_at = Column(DateTime)  # Время публикации
    archived = Column(Boolean)  # Архивирована ли вакансия
    url = Column(String)  # Ссылка на вакансию
    min_experience = Column(Integer, nullable=True)  # Минимальный опыт
    max_experience = Column(Integer, nullable=True)  # Максимальный опыт
    salary_to = Column(Integer, nullable=True)  # Максимальная зарплата
    salary_from = Column(Integer, nullable=True)  # Минимальная зарплата
    russian_salary_to = Column(Integer, nullable=True)  # Максимальная зарплата в рублях
    russian_salary_from = Column(Integer, nullable=True)  # Минимальная зарплата в рублях

class Resume(Base):
    __tablename__ = "resume"

    id_resume = Column(Text, primary_key=True)  # Уникальный идентификатор резюме
    title = Column(Text, nullable=True)  # Название резюме
    created_at = Column(DateTime)  # Время создания
    updated_at = Column(DateTime, nullable=True)  # Время последнего обновления
    age = Column(Integer, nullable=True)  # Возраст
    gender = Column(Text, nullable=True)  # Пол
    salary = Column(Numeric, nullable=True)  # Зарплата
    russian_salary = Column(Numeric, nullable=True)  # Зарплата в рублях
    currency = Column(Text, nullable=True)  # Валюта
    photo = Column(Boolean)  # Наличие фото
    total_experience = Column(Integer, nullable=True)  # Общий опыт работы
    citizenship = Column(ARRAY(Text), nullable=True)  # Гражданство (массив)
    area = Column(Text, nullable=True)  # Местоположение
    level_education = Column(Text, nullable=True)  # Уровень образования
    university = Column(ARRAY(Text), nullable=True)  # Университеты (массив)
    count_additional_courses = Column(Integer, nullable=True)  # Количество дополнительных курсов
    employments = Column(ARRAY(Text), nullable=True)  # Типы занятости (массив)
    experience = Column(ARRAY(Text), nullable=True)  # Опыт работы (массив)
    language_eng = Column(Text, nullable=True)  # Уровень английского языка
    language_zho = Column(Text, nullable=True)  # Уровень китайского языка
    schedules = Column(ARRAY(Text), nullable=True)  # График работы (массив)
    skill_set = Column(ARRAY(Text), nullable=True)  # Навыки (массив)
    is_driver = Column(Boolean, nullable=True)  # Наличие водительских прав
    professional_roles = Column(ARRAY(Text), nullable=True)  # Профессиональные роли (массив)
    url = Column(Text)  # Ссылка на резюме