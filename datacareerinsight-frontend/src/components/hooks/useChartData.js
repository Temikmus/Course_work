import { useState, useEffect } from 'react';
import axios from 'axios';

const API_BASE_URL = 'http://127.0.0.1:8000';

export const useChartData = (
    endpoint,
    initialFilters = {},
    initialParams = {},
    enabled = true
) => {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const fetchData = async (filters = {}, params = {}) => {
        if (!enabled) return;

        setLoading(true);
        setError(null);

        try {
            const queryParams = new URLSearchParams();

            // Добавляем основные параметры
            Object.entries({ ...initialParams, ...params }).forEach(([key, value]) => {
                if (value !== undefined && value !== null) {
                    queryParams.append(key, value);
                }
            });

            // Добавляем фильтры
            const filtersToUse = { ...initialFilters, ...filters };
            if (Object.keys(filtersToUse).length > 0) {
                const filtersStr = Object.entries(filtersToUse)
                    .map(([field, { operator, logic, value }]) =>
                        `${field}${operator}${logic}:${value}`)
                    .join(';');
                queryParams.append('filters', filtersStr);
            }

            const url = `${API_BASE_URL}${endpoint}?${queryParams.toString()}`;
            const response = await axios.get(url);

            if (response.status === 200) {
                setData(response.data);
            } else {
                throw new Error(`Ошибка сервера: ${response.status}`);
            }
        } catch (err) {
            setError(err.response?.data?.detail || err.message || 'Неизвестная ошибка');
            setData(null);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, [endpoint, JSON.stringify(initialParams), enabled]);

    return { data, loading, error, refetch: fetchData };
};