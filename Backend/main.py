from fastapi import FastAPI
from routers import vacancies, resumes, analytics

app = FastAPI()

app.include_router(vacancies.router, prefix="/api/v1")
app.include_router(resumes.router, prefix="/api/v1")
# app.include_router(analytics.router, prefix="/api/v1")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="127.0.0.1", port=8000)

