from dotenv import load_dotenv
import os
from authentication.hash_function import get_hash

def get_user_access(user, password):
    load_dotenv()
    USER_HASH = os.getenv("USER_HASH")
    PASSWORD_HASH = os.getenv("PASSWORD_HASH")


    if get_hash(password) == PASSWORD_HASH and get_hash(user) == USER_HASH:
        print("Доступ разрешён")
        return True
    print("Неверное имя пользователя или пароль")
    return False