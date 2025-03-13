import React, { useState, useEffect } from "react";
import { fields } from "./constants"; // Импортируем список полей

const GroupBy = ({ groupBy, onApplyGroupBy, onClearGroupBy, resetTrigger }) => {
    const [showColumnMenu, setShowColumnMenu] = useState(false); // Состояние для отображения меню
    const [selectedColumns, setSelectedColumns] = useState([]); // Выбранные столбцы

    // Синхронизация внутреннего состояния с пропсом groupBy
    useEffect(() => {
        if (groupBy) {
            setSelectedColumns(groupBy.split(",")); // Разделяем строку на массив столбцов
        } else {
            setSelectedColumns([]); // Если groupBy пустой, сбрасываем выбранные столбцы
        }
    }, [groupBy]);

    // Сброс состояния showColumnMenu при изменении resetTrigger
    useEffect(() => {
        setShowColumnMenu(false); // Скрываем меню
    }, [resetTrigger]);

    // Обработчик изменения выбранных столбцов
    const handleColumnToggle = (column) => {
        if (selectedColumns.includes(column)) {
            setSelectedColumns(selectedColumns.filter((col) => col !== column));
        } else {
            setSelectedColumns([...selectedColumns, column]);
        }
    };

    // Обработчик применения группировки
    const handleApplyGroupBy = () => {
        if (selectedColumns.length > 0) {
            const groupByValue = selectedColumns.join(",");
            onApplyGroupBy(groupByValue); // Передаем значение в родительский компонент
        }
    };

    // Обработчик очистки группировки
    const handleClearGroupBy = () => {
        setSelectedColumns([]); // Сбрасываем выбранные столбцы
        setShowColumnMenu(false); // Сбрасываем состояние меню (скрываем его)
        onClearGroupBy(); // Вызываем обработчик очистки
    };

    return (
        <div className="group-by">
            {/* Поле ввода (только для отображения) */}
            <input
                type="text"
                value={selectedColumns.join(",")} // Отображаем выбранные столбцы
                readOnly
                placeholder="Группировать по (через запятую)"
            />

            {/* Кнопка для отображения меню выбора столбцов */}
            <button onClick={() => setShowColumnMenu(!showColumnMenu)}>
                {showColumnMenu ? "Скрыть столбцы" : "Выбрать столбцы"}
            </button>

            {/* Выпадающее меню с чекбоксами */}
            {showColumnMenu && (
                <div className="column-menu">
                    {fields.map((column) => (
                        <label key={column} className="column-menu-item">
                            <input
                                type="checkbox"
                                checked={selectedColumns.includes(column)}
                                onChange={() => handleColumnToggle(column)}
                            />
                            {column.replace(/_/g, ' ').toUpperCase()}
                        </label>
                    ))}
                </div>
            )}

            {/* Кнопки для применения и очистки группировки */}
            <button onClick={handleApplyGroupBy}>
                Применить группировку
            </button>
            <button onClick={handleClearGroupBy} className="clear-btn">
                Очистить группировку
            </button>
        </div>
    );
};

export default GroupBy;