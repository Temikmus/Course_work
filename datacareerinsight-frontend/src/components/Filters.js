// Filters.jsx
import React, { useState  } from "react";
import {
    fields,
    operators,
    numericAggregations,
    nonNumericAggregations,
} from "./constants";
import { isNumericField } from "../utils/utils";

const Filters = ({ filters, onAddFilter, onRemoveFilter }) => {
    const [field, setField] = useState("");
    const [operator, setOperator] = useState("=");
    const [logic, setLogic] = useState("or");
    const [value, setValue] = useState("");


    // Обработчик выбора вспомогательного значения
    const handleHelperClick = (aggValue) => {
        if (field) {
            const formattedValue = `${aggValue}~${field}`;
            setValue(formattedValue);
        }
    };

    // Обработчик добавления фильтра
    const handleAddFilter = () => {
        if (field && operator && logic && value) {
            const formattedValue = value.split(",").join("~");
            onAddFilter({ field, operator, logic, value: formattedValue });
            setField("");
            setValue("");
        }
    };

    return (
        <div className="filters">
            <h3>Фильтры</h3>

            {/* Текущие фильтры */}
            <div className="active-filters">
                {filters.map((filter, index) => (
                    <div key={index} className="filter-item">
                        <span>{filter.field} {filter.operator} {filter.logic}: {filter.value.replace(/~/g, ", ")}</span>
                        <button onClick={() => onRemoveFilter(index)}>×</button>
                    </div>
                ))}
            </div>

            {/* Добавление нового фильтра */}
            <div className="add-filter">
                {/* Поле для выбора столбца */}
                <select value={field} onChange={(e) => setField(e.target.value)}>
                    <option value="">Выберите поле</option>
                    {fields.map((fieldName) => (
                        <option key={fieldName} value={fieldName}>
                            {fieldName}
                        </option>
                    ))}
                </select>

                {/* Оператор сравнения */}
                <select value={operator} onChange={(e) => setOperator(e.target.value)}>
                    {operators.map((op) => (
                        <option key={op.value} value={op.value}>
                            {op.label}
                        </option>
                    ))}
                </select>

                {/* Логика (AND/OR) */}
                <select value={logic} onChange={(e) => setLogic(e.target.value)}>
                    <option value="or">Или</option>
                    <option value="and">И</option>
                </select>

                {/* Ввод значения */}
                <input
                    type="text"
                    value={value}
                    onChange={(e) => setValue(e.target.value)}
                    placeholder="Значения (через запятую)"
                />

                {/* Вспомогательные значения */}
                <div className="helper-buttons">
                    {field && (
                        <>
                            {(isNumericField(field) ? numericAggregations : nonNumericAggregations).map((agg) => (
                                <button
                                    key={agg.value}
                                    onClick={() => handleHelperClick(agg.value)}
                                    className="helper-btn"
                                >
                                    {agg.label}
                                </button>
                            ))}
                        </>
                    )}
                </div>

                {/* Кнопка добавления фильтра */}
                <button onClick={handleAddFilter}>Добавить фильтр</button>
            </div>
        </div>
    );
};

export default Filters;