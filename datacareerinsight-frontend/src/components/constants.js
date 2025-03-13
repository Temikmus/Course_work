// constants.js
export const fields = [
    "title", "company_name", "currency", "experience", "type_of_employment",
    "work_format", "skills", "address", "min_experience", "max_experience",
    "salary_to", "salary_from", "russian_salary_to", "russian_salary_from",
    "bonus","published_at", "archived", "url", "id"
];

export const operators = [
    { value: "=", label: "Равно" },
    { value: "<", label: "Меньше" },
    { value: ">", label: "Больше" },
    { value: "<=", label: "Меньше или равно" },
    { value: ">=", label: "Больше или равно" },
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
    { value: "distinct_count", label: "Уникальные значения" },
    { value: "mode", label: "Мода" }
];

export const nonNumericAggregations = [
    { value: "mode", label: "Мода" }
];

export const numericFields = [
    "min_experience", "max_experience", "salary_to", "salary_from",
    "russian_salary_to", "russian_salary_from", "bonus"
];