import React, { useState, useEffect } from "react";
import { fields } from "./constants"; // Импортируем список полей

const SortBy = ({ columns, onApplySortBy, sortBy }) => {
    const [selectedColumn, setSelectedColumn] = useState(""); // Выбранный столбец
    const [sortOrder, setSortOrder] = useState("asc"); // Направление сортировки
    const [sortConditions, setSortConditions] = useState([]); // Список условий сортировки

    // Синхронизация внутреннего состояния с пропсом sortBy
    useEffect(() => {
        if (sortBy) {
            setSortConditions(sortBy.split(",")); // Разделяем строку на массив условий
        } else {
            setSortConditions([]); // Если sortBy пустой, сбрасываем условия
        }
    }, [sortBy]);

    // Функция для проверки, является ли столбец агрегированным
    const isAggregatedColumn = (column) => {
        return !fields.includes(column); // Если столбец не входит в fields, то он агрегированный
    };

    // Функция для преобразования агрегированного столбца в правильный формат
    const formatAggregatedColumn = (column) => {
        const lastUnderscoreIndex = column.lastIndexOf("_");
        if (lastUnderscoreIndex !== -1) {
            const columnName = column.slice(0, lastUnderscoreIndex); // Название столбца
            const aggregation = column.slice(lastUnderscoreIndex + 1); // Агрегирующая функция
            return `${columnName}:${aggregation}`;
        }
        return column; // Если не удалось разделить, возвращаем как есть
    };

    // Обработчик добавления условия сортировки
    const handleAddSortCondition = () => {
        if (selectedColumn) {
            const isAggregated = isAggregatedColumn(selectedColumn);
            const formattedColumn = isAggregated
                ? formatAggregatedColumn(selectedColumn) // Форматируем агрегированный столбец
                : selectedColumn; // Оставляем обычный столбец как есть
            const sortCondition = `${formattedColumn}:${sortOrder}`;
            setSortConditions([...sortConditions, sortCondition]); // Добавляем условие в список
            setSelectedColumn(""); // Сбрасываем выбор столбца
        }
    };

    // Обработчик удаления условия сортировки
    const handleRemoveSortCondition = (index) => {
        setSortConditions(sortConditions.filter((_, i) => i !== index));
    };

    // Обработчик применения сортировки
    const handleApplySortBy = () => {
        if (sortConditions.length > 0) {
            const sortByString = sortConditions.join(",");
            onApplySortBy(sortByString); // Передаем строку сортировки в родительский компонент
        }
    };

    return (
        <div className="sort-by">
            <h3>Сортировка</h3>

            {/* Текущие условия сортировки */}
            <div className="active-sort-conditions">
                {sortConditions.map((condition, index) => (
                    <div key={index} className="sort-condition-item">
                        <span>{condition}</span>
                        <button onClick={() => handleRemoveSortCondition(index)}>×</button>
                    </div>
                ))}
            </div>

            {/* Добавление нового условия сортировки */}
            <div className="add-sort-condition">
                <select
                    value={selectedColumn}
                    onChange={(e) => setSelectedColumn(e.target.value)}
                >
                    <option value="">Выберите столбец</option>
                    {columns.map((column) => (
                        <option key={column} value={column}>
                            {column}
                        </option>
                    ))}
                </select>

                <select
                    value={sortOrder}
                    onChange={(e) => setSortOrder(e.target.value)}
                >
                    <option value="asc">По возрастанию</option>
                    <option value="desc">По убыванию</option>
                </select>

                <button onClick={handleAddSortCondition}>Добавить условие</button>
            </div>

            {/* Кнопка применения сортировки */}
            <button onClick={handleApplySortBy}>Применить сортировку</button>
        </div>
    );
};

export default SortBy;