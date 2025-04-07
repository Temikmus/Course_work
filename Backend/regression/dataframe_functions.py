import pandas as pd
from database.db_connection import engine  # Импортируем engine из database.py


def load_table(table_name: str, query: str = None) -> pd.DataFrame:
    if query is None:
        query = f"SELECT * FROM {table_name}"
    return pd.read_sql(query, engine)


