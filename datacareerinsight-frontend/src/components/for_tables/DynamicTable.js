import React, { useState } from "react";

const DynamicTable = ({ data, visibleColumns, onToggleColumn }) => {
    const [showColumnMenu, setShowColumnMenu] = useState(false);

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
                                    onChange={() => onToggleColumn(column)}
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