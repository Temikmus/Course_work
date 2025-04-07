import requests
import time
from constants import keywords

def get_vacancies_with_dates(vacancy_name, date_list, access_token, conn):
    cursor = conn.cursor()
    count = 0
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
                "area": 113,
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
                    "archived": bool(vacancy_data.get('archived', None)),
                    "url": vacancy_data.get('alternate_url', None),
                }
                sql = """
                INSERT INTO vacancies (
                    id, title, company_name, salary_from, salary_to, currency, experience, 
                    type_of_employment, work_format, skills, description, address, published_at
                    , archived, url
                ) VALUES (
                    %(id)s, %(title)s, %(company_name)s, %(salary_from)s, %(salary_to)s, %(currency)s, %(experience)s,
                    %(type_of_employment)s, %(work_format)s, %(skills)s, %(description)s, %(address)s, %(published_at)s,
                    %(archived)s, %(url)s
                )
                """
                try:
                    cursor.execute(sql, vacancy)
                    conn.commit()
                    print("Данные успешно вставлены!")
                    count+=1
                except Exception as e:
                    print("Ошибка при вставке данных:", e)
                    conn.rollback()
            time.sleep(delay_seconds)
    return count