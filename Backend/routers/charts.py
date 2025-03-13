from fastapi import APIRouter, Depends, Query, WebSocket, WebSocketDisconnect, HTTPException
from sqlalchemy.orm import Session
from database import SessionLocal, get_db
from models import Vacancy
import sql_fucntions  # Подключаем твои функции

router = APIRouter()



@router.get("/chart/")
def get_chart_data(
        chart_type: str = Query(..., description="Тип графика (bar, line, pie и т. д.)"),
        x_axis: str = Query(..., description="Поле для оси X"),
        y_axis: str = Query(None, description="Поле для оси Y (необязательно для bar/pie, обязательно для heatmap)"),
        interval: str = Query(None, description="Интервал времени (day, week, month, year)"),
        group_by: str = Query(None, description="Поле для группировки"),
        filters: str = Query(None, description="Фильтры для данных"),
        aggregates: str = Query(None, description="Агрегаты (например, 'salary_from:AVG,salary_to:SUM')"),
        having: str = Query(None, description="Фильтрация агрегатов"),
        not_null: str = Query(None, description="Удаляет NULL значения"),
        #limit: int = Query(100, ge=1, le=1000, description="Ограничение выборки"),
        db: Session = Depends(get_db),
):
    query = db.query(Vacancy)

    # 🔹 Фильтрация (обычные и массивы)
    if filters:
        tuple_of_filters = sql_fucntions.parse_filters(filters)
        for column, value in tuple_of_filters.items():
            query = sql_fucntions.apply_filter_for_column(query, column, value[1], value[0], value[2], Vacancy)

    # 🔹 Определяем ось X
    x_col = getattr(Vacancy, x_axis, None)
    if not x_col:
        raise HTTPException(status_code=400, detail=f"Поле '{x_axis}' не найдено для оси X")

    # 🔹 Определяем ось Y
    y_col = None
    if y_axis:
        y_col = getattr(Vacancy, y_axis, None)
        if not y_col:
            raise HTTPException(status_code=400, detail=f"Поле '{y_axis}' не найдено для оси Y")

    # 🔹 Обрабатываем временной интервал (если нужно)
    grouped_column = None
    if interval:
        query, grouped_column = sql_fucntions.apply_time_interval_grouping(query, x_axis, interval, Vacancy)

    # 🔹 Группировка (включая интервал, если есть)
    group_columns = sql_fucntions.find_group_columns(group_by, Vacancy)
    if grouped_column:
        group_columns.append(grouped_column)

    # 🔹 Агрегаты
    selected_aggregates = sql_fucntions.find_aggregate_columns_for_group_by(aggregates, Vacancy)

    # 🔹 Применяем HAVING (фильтрация агрегатов)
    query = sql_fucntions.apply_having(query, having, selected_aggregates, Vacancy)

    # 🔹 Применяем NOT NULL (удаляем NULL-значения)
    query = sql_fucntions.apply_not_null_for_columns(query, not_null, Vacancy)

    # 🔹 Применяем GROUP BY и выполняем запрос
    query = sql_fucntions.apply_group_by(query, group_columns, selected_aggregates)

    # 🔹 Лимит выборки (ограничение количества строк)
    #query = query.limit(limit)

    # 🔹 Выполняем запрос
    results = query.all()

    # 🔹 Формируем корректную структуру данных
    return sql_fucntions.generate_chart_data_structure(results, x_axis, y_axis, chart_type)



# 🔹 WebSocket для обновления графиков в реальном времени
@router.websocket("/ws/chart/")
async def websocket_endpoint(websocket: WebSocket):
    await websocket.accept()
    try:
        while True:
            data = await websocket.receive_text()
            await websocket.send_text(f"Обновленные данные: {data}")
    except WebSocketDisconnect:
        print("Клиент отключился")
