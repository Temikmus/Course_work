import React, { useState, useEffect } from "react";

const Aggregates = ({
                        aggregates,
                        onApplyAggregates,
                        fieldsConfig = {
                            fields: [],
                            numericFields: [],
                            numericAggregations: [],
                            nonNumericAggregations: [],
                            dateFields: [],
                            dateAggregations: []
                        }
                    }) => {
    const [selectedColumn, setSelectedColumn] = useState("");
    const [selectedAggregation, setSelectedAggregation] = useState("");
    const [aggregatesList, setAggregatesList] = useState([]);

    const {
        fields,
        numericFields,
        numericAggregations,
        nonNumericAggregations,
        dateFields,
        dateAggregations
    } = fieldsConfig;

    useEffect(() => {
        setAggregatesList(aggregates ? aggregates.split(",") : []);
    }, [aggregates]);

    const handleAddAggregate = () => {
        if (selectedColumn && selectedAggregation) {
            const newAggregate = `${selectedColumn}:${selectedAggregation}`;
            const updatedAggregatesList = [...aggregatesList, newAggregate];
            setAggregatesList(updatedAggregatesList);
            onApplyAggregates(updatedAggregatesList.join(","));
            setSelectedColumn("");
            setSelectedAggregation("");
        }
    };

    const handleRemoveAggregate = (index) => {
        const updatedAggregatesList = aggregatesList.filter((_, i) => i !== index);
        setAggregatesList(updatedAggregatesList);
        onApplyAggregates(updatedAggregatesList.join(","));
    };

    const getAvailableAggregations = () => {
        if (numericFields.includes(selectedColumn)) {
            return numericAggregations;
        } else if (dateFields.includes(selectedColumn)) {
            return dateAggregations;
        }
        return nonNumericAggregations;
    };

    return (
        <div className="aggregates">
            <h3>Агрегации</h3>

            <div className="add-aggregate">
                <select
                    value={selectedColumn}
                    onChange={(e) => setSelectedColumn(e.target.value)}
                >
                    <option value="">Выберите столбец</option>
                    {fields.map((field) => (
                        <option key={field} value={field}>{field}</option>
                    ))}
                </select>

                <select
                    value={selectedAggregation}
                    onChange={(e) => setSelectedAggregation(e.target.value)}
                    disabled={!selectedColumn}
                >
                    <option value="">Выберите агрегацию</option>
                    {getAvailableAggregations().map((agg) => (
                        <option key={agg.value} value={agg.value}>{agg.label}</option>
                    ))}
                </select>

                <button
                    onClick={handleAddAggregate}
                    disabled={!selectedColumn || !selectedAggregation}
                >
                    Добавить агрегацию
                </button>
            </div>

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