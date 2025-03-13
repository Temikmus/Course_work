from sqlalchemy import create_engine, Column, String, Numeric
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
import requests
from datetime import datetime

# Подключение к базе данных
DATABASE_URL = "postgresql://postgres:Artem2407@localhost:5432/vacancies_db"
engine = create_engine(DATABASE_URL)
Session = sessionmaker(bind=engine)
session = Session()

# Определяем модель таблицы `currency`
Base = declarative_base()

class Currency(Base):
    __tablename__ = 'currency'
    name_currency = Column(String, primary_key=True)
    course_to_russia = Column(Numeric)

# Функция для получения курсов валют от Центробанка России
def get_currency_rates():
    url = "https://www.cbr-xml-daily.ru/daily_json.js"
    response = requests.get(url)
    if response.status_code == 200:
        data = response.json()
        return data['Valute']
    else:
        raise Exception("Не удалось получить данные о курсах валют")

# Получаем текущие курсы валют
currency_rates = get_currency_rates()


currency_data = {'RUR': 1.0}

# Добавляем курсы других валют
for currency_code, currency_info in currency_rates.items():
    if currency_code=='BYN':
        currency_code='BYR'
    currency_data[currency_code] = currency_info['Value'] / currency_info['Nominal']

#Обновляем данные в таблице
for currency_code, course in currency_data.items():
    # Ищем запись по первичному ключу (name_currency)
    currency = session.query(Currency).filter_by(name_currency=currency_code).first()
    if currency:
        currency.course_to_russia = course
    else:
        new_currency = Currency(name_currency=currency_code, course_to_russia=course)
        session.add(new_currency)

# Фиксируем изменения
session.commit()

# Закрываем сессию
session.close()

print(f"Курсы валют успешно обновлены! Дата обновления: {datetime.now()}\n Данные взяты с ЦентроБанка")