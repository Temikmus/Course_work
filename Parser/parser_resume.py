import requests
from datetime import datetime, timedelta
import time
import webbrowser
from urllib.parse import urlencode, urlparse, parse_qs
import psycopg2

# Подключение к PostgreSQL
conn = psycopg2.connect(
    host="localhost",  # Замените на ваш хост (например, '127.0.0.1' или адрес сервера)
    database="vacancies_db",  # Имя вашей базы данных
    user="postgres",    # Ваше имя пользователя PostgreSQL
    password="Artem2407" # Ваш пароль
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
    response = requests.post(token_url, data=token_data)
    response_data = response.json()

    if response.status_code == 200:
        print("Токен успешно получен!")
        return response_data
    else:
        print("Ошибка при получении токена:", response_data)
        return None


def generate_date_list(start_date, end_date, step_days=1):
    dates = []
    current_date = start_date
    while current_date < end_date:
        dates.append(current_date.strftime('%Y-%m-%d'))
        current_date += timedelta(days=step_days)
    dates.append(end_date.strftime('%Y-%m-%d'))
    return dates


def get_full_resume(resume_id, headers):
    url = f"https://api.hh.ru/resumes/{resume_id}"
    response = requests.get(url, headers=headers)

    if response.status_code == 200:
        return response.json()
    else:
        print(f"Ошибка {response.status_code} при получении резюме {resume_id}")
        return None

def escape_array_elements(data):
    arr = [elem.replace('"', '\\"') for elem in data]
    for i in range(len(arr)):
        if arr[i]:
            if arr[i][-1]==",":
                arr[i]=arr[i][:-1]
    return arr


cursor = conn.cursor()

count = 0 #кол-во добавленных резюме
def get_resumes_with_dates(keyword, date_list, access_token):
    base_url = "https://api.hh.ru/resumes"
    headers = {
        "User-Agent": "Mozilla/5.0",
        "Authorization": f"Bearer {access_token}"
    }
    per_page = 20
    delay_seconds = 1.0
    for i in range(len(date_list) - 1):
        date_to = date_list[i]
        date_from = date_list[i + 1]
        print(f"Собираем резюме с {date_from} по {date_to}...")
        time.sleep(delay_seconds)

        for page in range(100):
            params = {
                "text": keyword,
                "area": 113,
                "date_from": date_from,
                "date_to": date_to,
                "page": page,
                "per_page": per_page
            }
            response = requests.get(base_url, headers=headers, params=params)

            if response.status_code == 429:
                print("Слишком много запросов! Пауза на 10 секунд.")
                time.sleep(10)
                continue
            elif response.status_code != 200:
                print(f"Ошибка {response.status_code}. Пропускаем страницу {page} для интервала {date_from} - {date_to}")
                break

            data = response.json()
            items = data.get('items', [])
            print(f"Страница {page + 1}: найдено {len(items)} резюме")

            if not items:
                break

            for item in items:
                time.sleep(delay_seconds)
                resume_name = item.get('title', '').lower()
                # Фильтруем только вакансии с ключевыми словами в названии
                if not (any(keyword in resume_name for keyword in keywords)):
                    continue
                resume_id = item.get('id')
                print(resume_id)
                # Проверка существования id
                check_sql = "SELECT COUNT(*) FROM resume WHERE id_resume = %(id_resume)s;"
                cursor.execute(check_sql, {'id_resume': resume_id})
                exists = cursor.fetchone()[0]
                if exists:
                    print("Текущий id уже есть в таблице.")
                    continue
                full_resume = get_full_resume(resume_id, headers)
                if full_resume:
                    gender = full_resume.get('gender', None)
                    salary = full_resume.get('salary', None)
                    total_experience = full_resume.get('total_experience', None)
                    citizenship_arr = full_resume.get('citizenship', None)
                    citizenship=[]
                    for city in citizenship_arr:
                        citizenship.append(city.get('name', None))
                    citizenship = [x for x in citizenship if x is not None]
                    citizenship = escape_array_elements(citizenship)
                    area = full_resume.get('area', None)
                    education = full_resume.get('education', None)
                    additional = education.get('additional', None) if education else None
                    primary = education.get('primary', None) if education else None
                    universities = []
                    for university in primary:
                        universities.append(university.get('name', None))
                    universities = [x for x in universities if x is not None]
                    universities = escape_array_elements(universities)
                    level_eduaction = education.get('level', None) if education else None
                    level_eduaction_name = level_eduaction.get('name', None) if level_eduaction else None
                    employments = full_resume.get('employments', None)
                    employments_arr=[]
                    for employment in employments:
                        employments_arr.append(employment.get('name', None))
                    employments_arr = [x for x in employments_arr if x is not None]
                    employments_arr = escape_array_elements(employments_arr)
                    experience = full_resume.get('experience', None)
                    experience_arr = []
                    for exp in experience:
                        experience_arr.append(exp.get('company', None))
                    experience_arr = [x for x in experience_arr if x is not None]
                    experience_arr = escape_array_elements(experience_arr)
                    language = full_resume.get('language', None)
                    language_eng = None
                    language_zho = None
                    for lang in language:
                        if lang.get('id', None)=='eng':
                            level = lang.get('level', None)
                            if level:
                                language_eng = level.get('id', None)
                        elif lang.get('id', None)=='zho':
                            level = lang.get('level', None)
                            if level:
                                language_zho = level.get('id', None)
                    schedules = full_resume.get('schedules', None)
                    schedules_arr = []
                    for schedule in schedules:
                        schedules_arr.append(schedule.get('name', None))
                    schedules_arr = [x for x in schedules_arr if x is not None]
                    schedules_arr = escape_array_elements(schedules_arr)
                    professional_roles = full_resume.get('professional_roles', None)
                    professional_roles_arr=[]
                    for professional_role in professional_roles:
                        professional_roles_arr.append(professional_role.get('name', None))
                    professional_roles_arr = [x for x in professional_roles_arr if x is not None]
                    professional_roles_arr = escape_array_elements(professional_roles_arr)
                    resume_data={
                        "title": full_resume.get('title', None),
                        "id_resume": resume_id,
                        "created_at": full_resume.get('created_at', None),
                        "updated_at": full_resume.get('updated_at', None),
                        "age": int(full_resume.get('age')) if full_resume.get('age') else None,
                        "gender": gender.get('id', None) if gender else None,
                        "salary": float(salary.get('amount')) if salary else None,
                        "currency": salary.get('currency') if salary else None,
                        "photo": True if full_resume.get('photo') else False,
                        "total_experience": int(total_experience.get('months')) if total_experience else None,
                        "citizenship": "{" + ",".join(citizenship if citizenship else []) + "}",
                        "area": area.get('name', None) if area else None,
                        "level_education":level_eduaction_name,
                        "university": "{" + ",".join(universities if universities else [])+"}",
                        "count_additional_courses": len(additional) if additional else None,
                        "employments": "{" + ",".join(employments_arr if employments_arr else [])+"}",
                        "experience": "{" + ",".join(experience_arr if experience_arr else []) + "}",
                        "language_eng": language_eng,
                        "language_zho": language_zho,
                        "schedules": "{" + ",".join(schedules_arr if schedules_arr else [])+"}",
                        "skill_set": "{" + ",".join(escape_array_elements(full_resume.get('skill_set', []))) + "}",
                        "is_driver": True if (full_resume.get('driver_license_types', None)!=[] and full_resume.get('driver_license_types', None)!=None) else False,
                        "professional_roles": "{" + ",".join(professional_roles_arr if professional_roles_arr else []) + "}",
                        "url": full_resume.get('alternate_url', None)
                    }
                    sql = """
                    INSERT INTO resume (
                        title, id_resume, created_at, updated_at, age, gender, salary, currency,
                        photo, total_experience, citizenship, area, level_education, university,
                        count_additional_courses, employments, experience, language_eng,
                        language_zho, schedules, skill_set, is_driver, professional_roles, url
                    ) VALUES (
                        %(title)s, %(id_resume)s, %(created_at)s, %(updated_at)s, %(age)s, %(gender)s,
                        %(salary)s, %(currency)s, %(photo)s, %(total_experience)s, %(citizenship)s,
                        %(area)s, %(level_education)s, %(university)s, %(count_additional_courses)s,
                        %(employments)s, %(experience)s, %(language_eng)s, %(language_zho)s,
                        %(schedules)s, %(skill_set)s, %(is_driver)s, %(professional_roles)s, %(url)s
                    )
                    """
                    try:
                        cursor.execute(sql, resume_data)
                        conn.commit()
                        print("Данные успешно вставлены!")
                        global count
                        count += 1
                        print(count)
                    except Exception as e:
                        print("Ошибка при вставке данных:", e)
                        conn.rollback()
            time.sleep(delay_seconds)



client_id = "T7SU91LK7OENTG9CH5CL926RD6FEHIMM2NIN5FCOEMBL0PFF8PLN5EE5AHU39F5P"
client_secret = "NAAUJUHS3CIEEHNTUFD1DS4U5N66GNN4U1AB85B3RIOBQMFHJOUFTHDUS47NHSB8"
redirect_uri = "http://localhost"


token_data = get_access_token(client_id, client_secret, redirect_uri)
if token_data:
    access_token = token_data.get("access_token")
else:
    print("Ошибка получения токена")
    exit()



start_date = datetime(2025, 1, 1)
end_date = datetime(2025, 1, 29)
date_list = generate_date_list(start_date, end_date)
date_list.reverse()

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
resume_names = [
    "Аналитик",
    "Аналитик данных",
    "Data Analyst",
    "Бизнес-аналитик",
    "Business Intelligence Analyst",
    "BI-аналитик",
    "Аналитик больших данных",
    "Big Data Analyst",
    "Аналитик машинного обучения",
    "ML Analyst",
    "Системный аналитик",
    "Финансовый аналитик",
    "Маркетинговый аналитик",
    "Продуктовый аналитик",
    "Гейм-аналитик",
    "Веб-аналитик",
    "SMM-аналитик",
    "Аналитик маркетплейсов",
    "UX-аналитик",
    "Аналитик 1-С",
    "Data Scientist"
]

count = 0 #кол-во добавленных резюме


for resume_name in resume_names:
    get_resumes_with_dates(resume_name, date_list, access_token)

print("Сбор данных завершен.")



