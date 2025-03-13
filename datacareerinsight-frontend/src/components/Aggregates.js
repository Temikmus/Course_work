import React, { useState, useEffect } from "react";
import { fields, numericAggregations } from "./constants"; // Импортируем списки полей и агрегаций

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
            setAggregatesList([...aggregatesList, newAggregate]); // Добавляем в список
            setSelectedColumn(""); // Сбрасываем выбор столбца
            setSelectedAggregation(""); // Сбрасываем выбор агрегации
        }
    };

    // Обработчик удаления агрегации
    const handleRemoveAggregate = (index) => {
        setAggregatesList(aggregatesList.filter((_, i) => i !== index));
    };

    // Обработчик применения агрегаций
    const handleApplyAggregates = () => {
        if (aggregatesList.length > 0) {
            const aggregatesString = aggregatesList.join(",");
            onApplyAggregates(aggregatesString); // Передаем строку агрегаций в родительский компонент
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
                    {numericAggregations.map((agg) => (
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

            {/* Кнопка применения агрегаций */}
            <button onClick={handleApplyAggregates}>Применить агрегации</button>
        </div>
    );
};

export default Aggregates;