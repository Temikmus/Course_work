import React, { useState, useEffect } from "react";
import { fields, numericFields, numericAggregations, nonNumericAggregations } from "./constants";

const Aggregates = ({ aggregates, onApplyAggregates }) => {
    const [selectedColumn, setSelectedColumn] = useState(""); // Выбранный столбец
    const [selectedAggregation, setSelectedAggregation] = useState(""); // Выбранная агрегация
    const [aggregatesList, setAggregatesList] = useState([]); // Список агрегаций

    // Синхронизация внутреннего состояния с пропсом aggregates
    useEffect(() => {
        if (aggregates) {
            setAggregatesList(aggregates.split(","));
        } else {
            setAggregatesList([]);
        }
    }, [aggregates]);

    // Обработчик добавления агрегации
    const handleAddAggregate = () => {
        if (selectedColumn && selectedAggregation) {
            const newAggregate = `${selectedColumn}:${selectedAggregation}`;
            const updatedAggregatesList = [...aggregatesList, newAggregate];
            setAggregatesList(updatedAggregatesList); // Добавляем в список
            setSelectedColumn(""); // Сбрасываем выбор столбца
            setSelectedAggregation(""); // Сбрасываем выбор агрегации
            onApplyAggregates(updatedAggregatesList.join(",")); // Обновляем агрегации в родительском компоненте
        }
    };

    // Обработчик удаления агрегации
    const handleRemoveAggregate = (index) => {
        const updatedAggregatesList = aggregatesList.filter((_, i) => i !== index);
        setAggregatesList(updatedAggregatesList); // Удаляем из списка
        onApplyAggregates(updatedAggregatesList.join(",")); // Обновляем агрегации в родительском компоненте
    };

    // Получаем список агрегаций для выбранного столбца
    const getAvailableAggregations = () => {
        if (numericFields.includes(selectedColumn)) {
            return numericAggregations; // Числовые агрегации для числовых полей
        } else {
            return nonNumericAggregations; // Нечисловые агрегации для остальных полей
        }
    };

    return (
        <div className="aggregates">
            <h3>Агрегации</h3>

            {/* Выбор столбца и агрегации */}
            <div className="add-aggregate">
                <select
                    value={selectedColumn}
                    onChange={(e) => setSelectedColumn(e.target.value)}
                >
                    <option value="">Выберите столбец</option>
                    {fields.map((field) => (
                        <option key={field} value={field}>
                            {field}
                        </option>
                    ))}
                </select>

                <select
                    value={selectedAggregation}
                    onChange={(e) => setSelectedAggregation(e.target.value)}
                >
                    <option value="">Выберите агрегацию</option>
                    {getAvailableAggregations().map((agg) => (
                        <option key={agg.value} value={agg.value}>
                            {agg.label}
                        </option>
                    ))}
                </select>

                <button onClick={handleAddAggregate}>Добавить агрегацию</button>
            </div>

            {/* Список добавленных агрегаций */}
            <div className="aggregates-list">
                {aggregatesList.map((aggregate, index) => (
                    <div key={index} className="aggregate-item">
                        <span>{aggregate}</span>
                        <button onClick={() => handleRemoveAggregate(index)}>×</button>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default Aggregates;