import { useState, useEffect } from 'react';
import axios from 'axios';

const API_BASE_URL = 'http://127.0.0.1:8000';

export const useChartData = (endpoint, initialFilters = {}, initialParams = {}) => {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const fetchData = async (filters, params) => {
        setLoading(true);
        try {
            const queryParams = new URLSearchParams();

            Object.entries(params).forEach(([key, value]) => {
                if (value !== undefined && value !== null) {
                    queryParams.append(key, value);
                }
            });

            if (filters) {
                const filtersStr = Object.entries(filters)
                    .map(([field, {operator, logic, value}]) =>
                        `${field}${operator}${logic}:${value}`)
                    .join(';');

                if (filtersStr) {
                    queryParams.append('filters', filtersStr);
                }
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
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData(initialFilters, initialParams);
    }, []);

    return { data, loading, error, refetch: fetchData };
};