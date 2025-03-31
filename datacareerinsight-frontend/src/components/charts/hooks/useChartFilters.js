import { useState } from 'react';

export const useChartFilters = (initialFilters = []) => {
    const [filters, setFilters] = useState(initialFilters);

    const addFilter = (newFilter) => {
        setFilters([...filters, newFilter]);
    };

    const removeFilter = (index) => {
        setFilters(filters.filter((_, i) => i !== index));
    };

    const clearFilters = () => {
        setFilters([]);
    };

    const getFiltersQuery = () => {
        return filters.length > 0
            ? filters.map(f => `${f.field}${f.operator}${f.logic}:${f.value}`).join(';')
            : null;
    };

    return {
        filters,
        addFilter,
        removeFilter,
        clearFilters,
        getFiltersQuery
    };
};