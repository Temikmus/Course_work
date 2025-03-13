import React, { useState, useEffect } from "react";
import { fields } from "./constants"; // Импортируем список полей

const NotNullFilter = ({ notNull, onApplyNotNullFilter, resetTrigger }) => {
    const [showColumnMenu, setShowColumnMenu] = useState(false); // Состояние для отображения меню
    const [selectedColumns, setSelectedColumns] = useState([]); // Выбранные столбцы

    // Синхронизация внутреннего состояния с пропсом notNull
    useEffect(() => {
        if (notNull) {
            setSelectedColumns(notNull.split(",")); // Разделяем строку на массив столбцов
        } else {
            setSelectedColumns([]); // Если notNull пустой, сбрасываем выбранные столбцы
        }
    }, [notNull]);

    // Сброс состояния showColumnMenu при изменении resetTrigger
    useEffect(() => {
        setShowColumnMenu(false); // Скрываем меню
    }, [resetTrigger]);

    // Обработчик изменения выбранных столбцов
    const handleColumnToggle = (column) => {
        let updatedColumns;
        if (selectedColumns.includes(column)) {
            updatedColumns = selectedColumns.filter((col) => col !== column); // Удаляем столбец
        } else {
            updatedColumns = [...selectedColumns, column]; // Добавляем столбец
        }
        setSelectedColumns(updatedColumns); // Обновляем состояние
        onApplyNotNullFilter(updatedColumns.join(",")); // Применяем изменения к запросу
    };

    // Обработчик очистки фильтров
    const handleClearFilters = () => {
        setSelectedColumns([]); // Сбрасываем выбранные столбцы
        onApplyNotNullFilter(""); // Очищаем фильтр в родительском компоненте
    };

    return (
        <div className="not-null-filter">
            <h3>Фильтр по непустым значениям (NOT NULL)</h3>

            {/* Кнопка для отображения меню выбора столбцов */}
            <button onClick={() => setShowColumnMenu(!showColumnMenu)}>
                {showColumnMenu ? "Скрыть столбцы" : "Выбрать столбцы"}
            </button>

            {/* Кнопка очистки фильтров */}
            <button onClick={handleClearFilters} className="clear-btn">
                Очистить фильтры
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

            {/* Отображение выбранных столбцов */}
            <div className="selected-columns">
                <strong>Выбранные столбцы:</strong>
                {selectedColumns.length > 0 ? (
                    <span>{selectedColumns.join(", ")}</span>
                ) : (
                    <span>Нет выбранных столбцов</span>
                )}
            </div>
        </div>
    );
};

export default NotNullFilter;