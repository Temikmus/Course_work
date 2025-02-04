from fastapi import FastAPI
from routers import vacancies, resumes, analytics, vacancies_groupby, vacancies_table

app = FastAPI()

app.include_router(vacancies.router, prefix="/vacancies")
app.include_router(vacancies_groupby.router, prefix="/vacancies")
app.include_router(vacancies_table.router, prefix="/vacancies")
app.include_router(resumes.router, prefix="/resume")
# app.include_router(analytics.router, prefix="/api/v1")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="127.0.0.1", port=8000)

