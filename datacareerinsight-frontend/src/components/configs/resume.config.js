export const resumeFieldsConfig = {
    fields: [
        "id_resume", "title", "created_at", "updated_at", "age", "gender",
        "salary", "russian_salary", "currency", "photo", "total_experience",
        "citizenship", "area", "level_education", "university", "count_additional_courses",
        "employments", "experience", "language_eng", "language_zho", "schedules",
        "skill_set", "is_driver", "professional_roles", "url"
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
        "age", "salary", "russian_salary", "total_experience", "count_additional_courses"
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
    dateFields: ["created_at", "updated_at"],
    dateAggregations: [
        { value: "max", label: "Максимум" },
        { value: "min", label: "Минимум" },
        { value: "mode", label: "Мода" },
        { value: "count", label: "Количество" }
    ],
    // Стрелочная функция с явным доступом к полям
    getFilteredOperators: (field) => {
        // Доступ к полям через замыкание
        const { numericFields, dateFields, operators } = resumeFieldsConfig;

        if (numericFields.includes(field)) {
            return operators.filter(op => op.value !== "==");
        }
        if (dateFields.includes(field)) {
            return operators.filter(op => op.value !== "==");
        }
        return operators;
    },
};