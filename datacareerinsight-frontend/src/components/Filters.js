import React, { useState } from "react";
import DatePicker from "react-datepicker"; // Импортируем календарь
import "react-datepicker/dist/react-datepicker.css"; // Стили для календаря
import {
    fields,
    operators,
    numericAggregations,
    nonNumericAggregations,
    dateAggregations,
    dateFields,
    getFilteredOperators,
    numericFields,
} from "./constants";
import { isNumericField } from "../utils/utils";

const Filters = ({ filters, onAddFilter, onRemoveFilter }) => {
    const [field, setField] = useState("");
    const [operator, setOperator] = useState("=");
    const [logic, setLogic] = useState("or");
    const [value, setValue] = useState("");
    const [dateValue, setDateValue] = useState(null); // Состояние для выбранной даты
    const [isHelperSelected, setIsHelperSelected] = useState(false); // Состояние для отслеживания выбора предложенного значения

    // Обработчик выбора вспомогательного значения
    const handleHelperClick = (aggValue) => {
        if (field) {
            const formattedValue = `${aggValue}~${field}`;
            setValue(formattedValue);
            setIsHelperSelected(true); // Указываем, что выбрано предложенное значение
        }
    };

    // Обработчик изменения даты
    const handleDateChange = (date) => {
        setDateValue(date); // Сохраняем выбранную дату
        if (date) {
            const formattedDate = date.toISOString().split("T")[0]; // Преобразуем дату в формат YYYY-MM-DD
            setValue(formattedDate); // Устанавливаем значение для фильтра
        } else {
            setValue(""); // Если дата не выбрана, очищаем значение
        }
    };

    // Обработчик добавления фильтра
    const handleAddFilter = () => {
        if (field && operator && logic && value) {
            const formattedValue = value.split(",").join("~");
            onAddFilter({ field, operator, logic, value: formattedValue });
            setField("");
            setValue("");
            setDateValue(null); // Сбрасываем выбранную дату
            setIsHelperSelected(false); // Сбрасываем состояние выбора предложенного значения
        }
    };

    // Получаем отфильтрованные операторы для выбранного поля
    const filteredOperators = getFilteredOperators(field);

    // Получаем доступные агрегации для выбранного поля
    const getAvailableAggregations = () => {
        if (numericFields.includes(field)) {
            // Оставляем только нужные агрегации для числовых полей
            return numericAggregations.filter(agg =>
                ["avg", "max", "min", "median", "mode"].includes(agg.value)
            );
        } else if (dateFields.includes(field)) {
            // Для полей с датой показываем агрегации для дат
            return dateAggregations.filter(agg => agg.value !== "count");
        } else {
            // Для остальных полей убираем "Количество" (count)
            return nonNumericAggregations.filter(agg => agg.value !== "count");
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
                <select value={field} onChange={(e) => {
                    setField(e.target.value);
                    setIsHelperSelected(false); // Сбрасываем состояние при изменении поля
                }}>
                    <option value="">Выберите поле</option>
                    {fields.map((fieldName) => (
                        <option key={fieldName} value={fieldName}>
                            {fieldName}
                        </option>
                    ))}
                </select>

                {/* Оператор сравнения */}
                <select value={operator} onChange={(e) => setOperator(e.target.value)}>
                    {filteredOperators.map((op) => (
                        <option key={op.value} value={op.value}>
                            {op.label}
                        </option>
                    ))}
                </select>

                {/* Логика (AND/OR) - скрываем для published_at */}
                {!dateFields.includes(field) && (
                    <select value={logic} onChange={(e) => setLogic(e.target.value)}>
                        <option value="or">Или</option>
                        <option value="and">И</option>
                    </select>
                )}

                {/* Ввод значения */}
                {dateFields.includes(field) && !isHelperSelected ? (
                    // Календарь для выбора даты
                    <DatePicker
                        selected={dateValue}
                        onChange={handleDateChange}
                        dateFormat="yyyy-MM-dd"
                        placeholderText="Выберите дату"
                        className="date-picker-input"
                    />
                ) : (
                    // Текстовое поле для других значений
                    <input
                        type="text"
                        value={value}
                        onChange={(e) => setValue(e.target.value)}
                        placeholder="Значения (через запятую)"
                    />
                )}

                {/* Вспомогательные значения */}
                <div className="helper-buttons">
                    {field && (
                        <>
                            {getAvailableAggregations().map((agg) => (
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