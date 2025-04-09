export const vacanciesFieldsConfig = {
    fields: [
        { value: "title", label: "Название вакансии" },
        { value: "company_name", label: "Компании" },
        { value: "currency", label: "Валюта" },
        { value: "experience", label: "Опыт" },
        { value: "type_of_employment", label: "Тип занятости" },
        { value: "work_format", label: "Формат работы" },
        { value: "skills", label: "Навыки" },
        { value: "address", label: "Адрес" },
        { value: "min_experience", label: "Мин. опыт" },
        { value: "max_experience", label: "Макс. опыт" },
        { value: "salary_to", label: "Зарплата до" },
        { value: "salary_from", label: "Зарплата от" },
        { value: "russian_salary_to", label: "Зарплата до (руб)" },
        { value: "russian_salary_from", label: "Зарплата от (руб)" },
        { value: "published_at", label: "Дата публикации" },
        { value: "archived", label: "Архивировано" },
        { value: "url", label: "Ссылка" },
        { value: "id", label: "ID" }
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