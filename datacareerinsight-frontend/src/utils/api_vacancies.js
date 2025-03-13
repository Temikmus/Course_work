import axios from 'axios';

export const generateFiltersQuery = (filters) => {
    return filters.map((filter) => {
        const values = filter.values.replace(/,/g, '~');
        return `${filter.column}${filter.operator}${filter.logic}:${values}`;
    }).join(';');
};

export const generateFieldsQuery = (columns) => {
    return Object.keys(columns)
        .filter((column) => columns[column])
        .join(',');
};

export const fetchVacancies = async (offset, columns, filters) => {
    const fieldsQuery = generateFieldsQuery(columns);
    const filtersQuery = generateFiltersQuery(filters);

    const queryParams = {
        offset: offset,
        specific_fields: fieldsQuery,
        filters: filtersQuery,
    };

    try {
        const response = await axios.get('http://127.0.0.1:8000/vacancies/table/', {
            params: queryParams,
        });
        return response.data;
    } catch (error) {
        console.error('Error fetching vacancies:', error);
        throw error;
    }
};
