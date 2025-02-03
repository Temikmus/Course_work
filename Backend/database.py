from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

DATABASE_URL = "postgresql://postgres:Artem2407@localhost:5432/vacancies_db"


engine = create_engine(DATABASE_URL)  # Подключение к базе
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)  # Сессия для работы
