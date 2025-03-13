import React, { useState, useEffect } from "react";

const DynamicTable = ({ data }) => {
    const [visibleColumns, setVisibleColumns] = useState({});
    const [showColumnMenu, setShowColumnMenu] = useState(false);

    // Столбцы, которые должны быть скрыты по умолчанию
    const hiddenColumnsByDefault = ["id", "currency", "experience", "archived", "url", "salary_to", "salary_from"];

    // Инициализация видимости столбцов при первом рендере и при изменении данных
    useEffect(() => {
        if (data.length > 0) {
            const columns = Object.keys(data[0]);
            const initialVisibility = {};

            columns.forEach((column) => {
                // Если столбец уже был видим, оставляем его видимым
                if (visibleColumns[column] !== undefined) {
                    initialVisibility[column] = visibleColumns[column];
                } else {
                    // Новые столбцы делаем видимыми по умолчанию, кроме тех, что в hiddenColumnsByDefault
                    initialVisibility[column] = !hiddenColumnsByDefault.includes(column);
                }
            });

            setVisibleColumns(initialVisibility);
        }
    }, [data]); // Зависимость от data

    // Обработчик изменения видимости столбца
    const handleColumnToggle = (column) => {
        setVisibleColumns((prev) => ({
            ...prev,
            [column]: !prev[column],
        }));
    };

    if (data.length === 0) {
        return <div>Нет данных для отображения</div>;
    }

    // Определяем столбцы на основе ключей первого элемента
    const columns = Object.keys(data[0]);

    return (
        <div className="dynamic-table-container">
            {/* Кнопка для управления видимостью столбцов */}
            <div className="column-toggle">
                <button onClick={() => setShowColumnMenu(!showColumnMenu)}>
                    {showColumnMenu ? "Скрыть настройки столбцов" : "Настроить столбцы"}
                </button>

                {/* Выпадающее меню с чекбоксами */}
                {showColumnMenu && (
                    <div className="column-menu">
                        {columns.map((column) => (
                            <label key={column} className="column-menu-item">
                                <input
                                    type="checkbox"
                                    checked={visibleColumns[column]}
                                    onChange={() => handleColumnToggle(column)}
                                />
                                {column.replace(/_/g, ' ').toUpperCase()}
                            </label>
                        ))}
                    </div>
                )}
            </div>

            {/* Таблица */}
            <table className="dynamic-table">
                <thead>
                <tr>
                    {columns.map(
                        (column) =>
                            visibleColumns[column] && (
                                <th key={column}>{column.replace(/_/g, ' ').toUpperCase()}</th>
                            )
                    )}
                </tr>
                </thead>
                <tbody>
                {data.map((row, rowIndex) => (
                    <tr key={rowIndex}>
                        {columns.map(
                            (column) =>
                                visibleColumns[column] && (
                                    <td key={column}>
                                        {Array.isArray(row[column]) ? row[column].join(", ") : row[column]}
                                    </td>
                                )
                        )}
                    </tr>
                ))}
                </tbody>
            </table>
        </div>
    );
};

export default DynamicTable;