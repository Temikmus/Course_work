from datetime import datetime
from authentication.database import get_connection
from parser_functions.date_list_generation import generate_date_list
from parser_functions.get_vacancies import get_vacancies_with_dates
from parser_functions.get_resume import get_resumes_with_dates
from authentication.token_authentication import get_access_token
from authentication.user_authentication import get_user_access
from constants import role_names
from parser_functions.currency_table import update_currency_table



def parse_data():
    token_data = get_access_token()
    if token_data:
        user = input("Введите пользователя: ")
        password = input("Введите пароль: ")
        if get_user_access(user, password):
            access_token = token_data.get("access_token")
            date_list = generate_date_list(datetime(2023, 1, 1), datetime(2025, 4, 5))
            table = input("Для какой таблицы идет сбор данных: Вакансии (v), Резюме (r), Валюты (c): ")
            conn = get_connection(user=user, password=password)
            count = 0
            if table == "v":
                for name in role_names:
                    count += get_vacancies_with_dates(name, date_list, access_token, conn)
            elif table=="r":
                for name in role_names:
                    count += get_resumes_with_dates(name, date_list, access_token, conn)
            else:
                update_currency_table(conn)
            conn.close()
            if table!="c":
                if count!=0:
                    print("Данные сохранены в Базу данных")
                    print("Всего было собрано:", count)
                else:
                    print("Новых данных не было добавлено")
        else:
            print("Неверный пользователь или пароль")
    else:
        print("Что-то не так с access_token")

if __name__ == "__main__":
    parse_data()


