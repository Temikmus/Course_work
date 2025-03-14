// constants.js
export const fields = [
    "title", "company_name", "currency", "experience", "type_of_employment",
    "work_format", "skills", "address", "min_experience", "max_experience",
    "salary_to", "salary_from", "russian_salary_to", "russian_salary_from",
    "bonus", "published_at", "archived", "url", "id"
];

export const operators = [
    { value: "=", label: "Равно" },
    { value: "<", label: "Меньше" },
    { value: ">", label: "Больше" },
    { value: "<=", label: "Меньше или равно" },
    { value: ">=", label: "Больше или равно" },
    { value: "!=", label: "Не равно" },
    { value: "==", label: "Содержит" }
];

export const numericAggregations = [
    { value: "avg", label: "Среднее" },
    { value: "sum", label: "Сумма" },
    { value: "max", label: "Максимум" },
    { value: "min", label: "Минимум" },
    { value: "count", label: "Количество" },
    { value: "median", label: "Медиана" },
    { value: "stddev", label: "Стандартное отклонение" },
    { value: "variance", label: "Дисперсия" },
    { value: "mode", label: "Мода" }
];

export const nonNumericAggregations = [
    { value: "mode", label: "Мода" },
    { value: "count", label: "Количество" }
];

// Агрегации для полей с датами
export const dateAggregations = [
    { value: "max", label: "Максимум" },
    { value: "min", label: "Минимум" },
    { value: "mode", label: "Мода" },
    { value: "count", label: "Количество" }
];

export const numericFields = [
    "min_experience", "max_experience", "salary_to", "salary_from",
    "russian_salary_to", "russian_salary_from", "bonus", "id"
];

// Поля, которые обрабатываются как дата
export const dateFields = ["published_at"];

// Функция для получения отфильтрованных операторов в зависимости от типа поля
export const getFilteredOperators = (field) => {
    if (numericFields.includes(field)) {
        // Для числовых полей убираем "Содержит"
        return operators.filter(op => op.value !== "==");
    } else if (dateFields.includes(field)) {
        // Для полей с датой убираем "Содержит"
        return operators.filter(op => op.value !== "==");
    } else {
        // Для остальных полей все операторы доступны
        return operators;
    }
};