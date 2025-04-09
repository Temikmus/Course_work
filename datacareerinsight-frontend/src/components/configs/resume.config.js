export const resumeFieldsConfig = {
    fields: [
        { value: "id_resume", label: "ID" },
        { value: "title", label: "Название" },
        { value: "created_at", label: "Дата создания" },
        { value: "updated_at", label: "Дата обновления" },
        { value: "age", label: "Возраст" },
        { value: "gender", label: "Пол" },
        { value: "salary", label: "Зарплата" },
        { value: "russian_salary", label: "Зарплата (руб)" },
        { value: "currency", label: "Валюта" },
        { value: "photo", label: "Есть фото" },
        { value: "total_experience", label: "Общий опыт (мес.)" },
        { value: "citizenship", label: "Гражданство" },
        { value: "area", label: "Место жительства" },
        { value: "level_education", label: "Уровень образования" },
        { value: "university", label: "Университеты" },
        { value: "count_additional_courses", label: "Кол-во доп. курсов" },
        { value: "employments", label: "Тип занятости" },
        { value: "experience", label: "Где работал" },
        { value: "language_eng", label: "Уровень английского" },
        { value: "language_zho", label: "Уровень китайского" },
        { value: "schedules", label: "График" },
        { value: "skill_set", label: "Навыки" },
        { value: "is_driver", label: "Есть водительские права" },
        { value: "professional_roles", label: "Проф. роли" },
        { value: "url", label: "Ссылка" }
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