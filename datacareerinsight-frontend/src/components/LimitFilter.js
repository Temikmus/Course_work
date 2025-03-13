import React, { useState, useEffect } from "react";

const LimitFilter = ({ limit, onApplyLimit, resetTrigger }) => {
    const [value, setValue] = useState(limit || 8); // Значение по умолчанию = 8

    // Сброс значения при изменении resetTrigger
    useEffect(() => {
        setValue(8); // Сбрасываем значение на 8
    }, [resetTrigger]);

    // Обработчик изменения значения
    const handleChange = (e) => {
        const newValue = e.target.value;
        setValue(newValue);
    };

    // Обработчик применения лимита
    const handleApplyLimit = () => {
        if (value > 0) {
            onApplyLimit(value); // Передаем значение в родительский компонент
        }
    };

    return (
        <div className="limit-filter">
            <span>Строк на странице:</span>
            <input
                type="number"
                value={value}
                onChange={handleChange}
                min="1"
                placeholder="8"
                className="limit-input"
            />
            <button onClick={handleApplyLimit}>Применить</button>
        </div>
    );
};

export default LimitFilter;