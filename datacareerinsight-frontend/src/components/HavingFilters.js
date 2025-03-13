import React, { useState } from "react";
import { operators } from "./constants"; // Импортируем операторы

const HavingFilters = ({ aggregates, onAddHavingFilter, onRemoveHavingFilter, havingFilters }) => {
    const [column, setColumn] = useState(""); // Выбранный столбец
    const [operator, setOperator] = useState(">"); // Оператор сравнения
    const [value, setValue] = useState(""); // Значение для сравнения

    // Обработчик добавления фильтра
    const handleAddHavingFilter = () => {
        if (column && operator && value) {
            // Находим полное название агрегированного поля (например, "salary_from:avg")
            const fullAggregate = aggregates.find((agg) => agg.startsWith(column));
            if (fullAggregate) {
                const havingFilter = `${fullAggregate}${operator}${value}`;
                onAddHavingFilter(havingFilter); // Передаем фильтр в родительский компонент
                setColumn(""); // Сбрасываем выбор столбца
                setValue(""); // Сбрасываем значение
            }
        }
    };

    // Убираем оператор "Содержит" (==) для HAVING
    const filteredOperators = operators.filter(op => op.value !== "==");

    return (
        <div className="having-filters">
            <h3>Фильтры по агрегированным полям (HAVING)</h3>

            {/* Текущие фильтры */}
            <div className="active-having-filters">
                {havingFilters.map((filter, index) => (
                    <div key={index} className="having-filter-item">
                        <span>{filter}</span>
                        <button onClick={() => onRemoveHavingFilter(index)}>×</button>
                    </div>
                ))}
            </div>

            {/* Добавление нового фильтра */}
            <div className="add-having-filter">
                <select
                    value={column}
                    onChange={(e) => setColumn(e.target.value)}
                >
                    <option value="">Выберите столбец</option>
                    {aggregates.map((agg) => (
                        <option key={agg} value={agg.split(":")[0]}>
                            {agg} {/* Отображаем полное название (например, "salary_from:avg") */}
                        </option>
                    ))}
                </select>

                <select
                    value={operator}
                    onChange={(e) => setOperator(e.target.value)}
                >
                    {filteredOperators.map((op) => (
                        <option key={op.value} value={op.value}>
                            {op.label} {/* Отображаем текстовую метку (например, "Больше") */}
                        </option>
                    ))}
                </select>

                <input
                    type="text"
                    value={value}
                    onChange={(e) => setValue(e.target.value)}
                    placeholder="Значение"
                />

                <button onClick={handleAddHavingFilter}>Добавить фильтр</button>
            </div>
        </div>
    );
};

export default HavingFilters;