import requests
from datetime import datetime
from decimal import Decimal


def get_currency_rates():
    url = "https://www.cbr-xml-daily.ru/daily_json.js"
    response = requests.get(url)
    if response.status_code == 200:
        data = response.json()
        return data['Valute']
    else:
        raise Exception("Не удалось получить данные о курсах валют")

def update_currency_table(conn):
    cursor = conn.cursor()
    currency_rates = get_currency_rates()
    currency_data = {'RUR': 1.0}

    for currency_code, currency_info in currency_rates.items():
        if currency_code == 'BYN':
            currency_code = 'BYR'
        value = Decimal(str(currency_info['Value'])) / Decimal(str(currency_info['Nominal']))
        currency_data[currency_code] = value

    for currency_code, course in currency_data.items():
        cursor.execute("SELECT 1 FROM currency WHERE name_currency = %s", (currency_code,))
        if cursor.fetchone():
            cursor.execute("""
                    UPDATE currency SET course_to_russia = %s WHERE name_currency = %s
                """, (course, currency_code))
        else:
            cursor.execute("""
                    INSERT INTO currency (name_currency, course_to_russia) VALUES (%s, %s)
                """, (currency_code, course))

    conn.commit()
    print(f"Курсы валют успешно обновлены")



