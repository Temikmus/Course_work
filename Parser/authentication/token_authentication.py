import requests
import webbrowser
from urllib.parse import urlencode, urlparse, parse_qs
from dotenv import load_dotenv
import os

def get_access_token():
    load_dotenv()

    CLIENT_ID = os.getenv("CLIENT_ID")
    CLIENT_SECRET = os.getenv("CLIENT_SECRET")
    REDIRECT_URI = os.getenv("REDIRECT_URI")

    auth_url = "https://hh.ru/oauth/authorize"
    params = {
        "response_type": "code",
        "client_id": CLIENT_ID,
        "redirect_uri": REDIRECT_URI,
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
        "client_id": CLIENT_ID,
        "client_secret": CLIENT_SECRET,
        "redirect_uri": REDIRECT_URI,
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