from fastapi import FastAPI
from routers import resumes_table, vacancies_table, charts, get_model_structure, salary
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()

# Разрешаем все домены
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(vacancies_table.router, prefix="/vacancies")
app.include_router(resumes_table.router, prefix="/resume")
app.include_router(charts.router, prefix="/charts")
app.include_router(get_model_structure.router, prefix="/prediction")
app.include_router(salary.router, prefix="/prediction")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="127.0.0.1", port=8000)