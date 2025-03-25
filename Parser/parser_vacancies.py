import requests
from datetime import datetime, timedelta
import time
import psycopg2
import webbrowser
from urllib.parse import urlencode, urlparse, parse_qs


# Подключение к PostgreSQL
conn = psycopg2.connect(
    host="localhost",
    database="vacancies_db",
    user="postgres",
    password="Artem2407"
)

def get_access_token(client_id, client_secret, redirect_uri):
    auth_url = "https://hh.ru/oauth/authorize"
    params = {
        "response_type": "code",
        "client_id": client_id,
        "redirect_uri": redirect_uri,
        "state": "randomstring123",
    }
    auth_request_url = f"{auth_url}?{urlencode(params)}"

    print("Откройте эту ссылку в браузере и подтвердите доступ:")
    print(auth_request_url)
    webbrowser.open(auth_request_url)

    redirect_response = input("Введите URL, на который вас перенаправило после авторизации: ")
    parsed_url = urlparse(redirect_response)
    query_params = parse_qs(parsed_url.query)
    code = query_params.get("code", [None])[0]

    if not code:
        print("Ошибка: authorization_code не найден.")
        return None

    token_url = "https://hh.ru/oauth/token"
    token_data = {
        "grant_type": "authorization_code",
        "code": code,
        "client_id": client_id,
        "client_secret": client_secret,
        "redirect_uri": redirect_uri,
    }
    try:
        response = requests.post(token_url, data=token_data)
        response_data = response.json()

        if response.status_code == 200:
            print("Токен успешно получен!")
            return response_data
        else:
            print("Ошибка при получении токена:", response_data)
            return None
    except Exception as e:
        print("Произошла ошибка при обращении к API:", e)
        return None


client_id = "T7SU91LK7OENTG9CH5CL926RD6FEHIMM2NIN5FCOEMBL0PFF8PLN5EE5AHU39F5P"
client_secret = "NAAUJUHS3CIEEHNTUFD1DS4U5N66GNN4U1AB85B3RIOBQMFHJOUFTHDUS47NHSB8"
redirect_uri = "http://localhost"

token_data = get_access_token(client_id, client_secret, redirect_uri)



cursor = conn.cursor()
def generate_date_list(start_date, end_date, step_days=2):
    dates = []
    current_date = start_date
    while current_date < end_date:
        dates.append(current_date.strftime('%Y-%m-%d'))
        current_date += timedelta(days=step_days)
    dates.append(end_date.strftime('%Y-%m-%d'))  # Добавляем конечную дату
    return dates
def get_vacancies_with_dates(vacancy_name, date_list, access_token):
    base_url = "https://api.hh.ru/vacancies"
    headers = {
        "User-Agent": "Mozilla/5.0",
        "Authorization": f"Bearer {access_token}"
    }
    per_page = 20
    delay_seconds = 1.0
    for i in range(len(date_list) - 1):
        date_from = date_list[i]
        date_to = date_list[i + 1]
        print(f"Собираем вакансии с {date_from} по {date_to}...")
        time.sleep(delay_seconds)
        for page in range(100):
            params = {
                "text": vacancy_name,
                "area": 113,  # Код России
                "date_from": date_from,
                "date_to": date_to,
                "page": page,
                "per_page": per_page
            }
            response = requests.get(base_url, headers=headers, params=params)

            if response.status_code == 429:
                print("Слишком много запросов! Пауза на 10 секунд.")
                time.sleep(10)  # Долгая пауза при превышении лимита
                continue
            elif response.status_code != 200:
                print(
                    f"Ошибка {response.status_code}. Пропускаем страницу {page} для интервала {date_from} - {date_to}")
                break

            data = response.json()
            items = data.get('items', [])
            print(f"Страница {page + 1}: найдено {len(items)} вакансий")

            if not items:
                break

            for item in data.get('items', []):
                time.sleep(delay_seconds)
                vacancy_name = item.get('name', '').lower()
                # Фильтруем только вакансии с ключевыми словами в названии
                if not (any(keyword in vacancy_name for keyword in keywords)):
                    continue
                id = int(item.get('id'))
                # Проверка существования id
                check_sql = "SELECT COUNT(*) FROM vacancies WHERE id = %(id)s;"
                cursor.execute(check_sql, {'id': id})
                exists = cursor.fetchone()[0]
                if exists:
                    print("Текущий id уже есть в таблице.")
                    continue
                vacancy_id = id
                vacancy_response = requests.get(f"{base_url}/{vacancy_id}", headers=headers)
                if vacancy_response.status_code == 429:
                    print("Слишком много запросов при получении вакансии! Пауза на 10 секунд.")
                    time.sleep(10)
                    continue
                elif vacancy_response.status_code != 200:
                    print(f"Ошибка {vacancy_response.status_code}. Пропускаем вакансию {vacancy_id}")
                    continue
                vacancy_data = vacancy_response.json()
                salary = vacancy_data.get('salary', {})
                if salary:
                    salary_from = salary.get('from', None)
                    salary_to = salary.get('to', None)
                    currency = salary.get('currency', None)
                else:
                    salary_from = None
                    salary_to = None
                    currency = None
                if salary_from:
                    salary_from=int(salary_from)
                if salary_to:
                    salary_to=int(salary_to)
                employer = vacancy_data.get('employer', {})
                experience = vacancy_data.get('experience', {})
                employment = vacancy_data.get('employment', {})
                schedule = vacancy_data.get('schedule', {})
                area = vacancy_data.get('area', {})
                insider_interview = vacancy_data.get('insider_interview', {})
                vacancy_id = int(vacancy_id)
                bonus = insider_interview.get('title', None) if insider_interview else None
                if bonus:
                    bonus = int(bonus)
                print(vacancy_id, type(vacancy_id))
                vacancy = {
                    "id": vacancy_id,
                    "title": vacancy_data.get('name', None),
                    "company_name": employer.get('name', None) if employer else None,
                    "salary_from": salary_from,
                    "salary_to": salary_to,
                    "currency": currency,
                    "experience": experience.get('name', None) if experience else None,
                    "type_of_employment": employment.get('name', None) if employment else None,
                    "work_format": schedule.get('name', None) if schedule else None,
                    "skills": "{" + ",".join([skill.get('name', None) for skill in vacancy_data.get('key_skills', [])]) + "}",
                    "description": vacancy_data.get('description', None),
                    "address": area.get('name', None) if area else None,
                    "published_at": vacancy_data.get('published_at', None),
                    "bonus": bonus,
                    "archived": bool(vacancy_data.get('archived', None)),
                    "url": vacancy_data.get('alternate_url', None),
                }
                sql = """
                INSERT INTO vacancies (
                    id, title, company_name, salary_from, salary_to, currency, experience, 
                    type_of_employment, work_format, skills, description, address, published_at, 
                    bonus, archived, url
                ) VALUES (
                    %(id)s, %(title)s, %(company_name)s, %(salary_from)s, %(salary_to)s, %(currency)s, %(experience)s,
                    %(type_of_employment)s, %(work_format)s, %(skills)s, %(description)s, %(address)s, %(published_at)s,
                    %(bonus)s, %(archived)s, %(url)s
                )
                """
                try:
                    cursor.execute(sql, vacancy)
                    conn.commit()
                    print("Данные успешно вставлены!")
                    global count
                    count+=1
                except Exception as e:
                    print("Ошибка при вставке данных:", e)
                    conn.rollback()
            time.sleep(delay_seconds)
    print(f"Всего вакансий собрано: {count}")
    return


start_date = datetime(2025, 1, 10)
end_date = datetime(2025, 3, 24)
date_list = generate_date_list(start_date, end_date)

#ключевые слова для фильтрации
keywords = [
    "аналитик", "анализ", "data analytics",
    "data scientist", "data analysis", "analyst",
    "big data", "data engineer", "data specialist",
    "data analytics specialist", "data insights", "data visualization",
    "data modeling", "data architect", "data consultant",
    "инженер данных", "инженер по данным",
    "data mining"
]


#ключевые слова для поиска
vacancies_name = ["Маркетинговый аналитик", "Продуктовый аналитик", "BI-аналитик", "Гейм-аналитик", "Финансовый аналитик",
            "Системный аналитик", "Веб-аналитик", "Аналитик маркетплейсов", "Аналитик 1-С",
            "SMM-аналитик", "Аналитик данных", "UX-аналитик", "Data Analyst", "Data Scientist", "Бизнес-аналитик", "Business Intelligence Analyst", "Аналитик больших данных",
            "Big Data Analyst", "Аналитик машинного обучения", "ML Analyst", "Аналитик"]

count = 0 #кол-во добавленных резюме

if token_data:
    access_token = token_data.get("access_token")
    for name in vacancies_name:
        get_vacancies_with_dates(name, date_list, access_token)
else:
    print("Something wrong with access_token")


cursor.close()
conn.close()

print("Данные сохранены в Базу данных")
print("Всего было собрано:",count)





