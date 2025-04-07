export const vacanciesFieldsConfig = {
    fields: [
        "title", "company_name", "currency", "experience", "type_of_employment",
        "work_format", "skills", "address", "min_experience", "max_experience",
        "salary_to", "salary_from", "russian_salary_to", "russian_salary_from",
        "published_at", "archived", "url", "id"
    ],
    operators: [
        { value: "=", label: "Равно" },
        { value: "<", label: "Меньше" },
        { value: ">", label: "Больше" },
        { value: "<=", label: "Меньше или равно" },
        { value: ">=", label: "Больше или равно" },
        { value: "!=", label: "Не равно" },
        { value: "==", label: "Содержит" }
    ],
    numericFields: [
        "min_experience", "max_experience", "salary_to", "salary_from",
        "russian_salary_to", "russian_salary_from", "id"
    ],
    numericAggregations: [
        { value: "avg", label: "Среднее" },
        { value: "sum", label: "Сумма" },
        { value: "max", label: "Максимум" },
        { value: "min", label: "Минимум" },
        { value: "count", label: "Количество" },
        { value: "median", label: "Медиана" },
        { value: "stddev", label: "Стандартное отклонение" },
        { value: "variance", label: "Дисперсия" },
        { value: "mode", label: "Мода" }
    ],
    nonNumericAggregations: [
        { value: "mode", label: "Мода" },
        { value: "count", label: "Количество" }
    ],
    dateFields: ["published_at"],
    dateAggregations: [
        { value: "max", label: "Максимум" },
        { value: "min", label: "Минимум" },
        { value: "mode", label: "Мода" },
        { value: "count", label: "Количество" }
    ],
    // Стрелочная функция с явным доступом к полям
    getFilteredOperators: (field) => {
        // Доступ к полям через замыкание
        const { numericFields, dateFields, operators } = vacanciesFieldsConfig;

        if (numericFields.includes(field)) {
            return operators.filter(op => op.value !== "==");
        }
        if (dateFields.includes(field)) {
            return operators.filter(op => op.value !== "==");
        }
        return operators;
    },
};