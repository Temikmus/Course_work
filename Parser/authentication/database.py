import psycopg2

def get_connection(user, password):
    return psycopg2.connect(
        host="localhost",
        database="vacancies_db",
        user=user,
        password=password
    )