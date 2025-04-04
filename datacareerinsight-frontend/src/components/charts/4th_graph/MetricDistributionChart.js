import React, { useState, useEffect } from 'react';
import { useChartData } from '../hooks/useChartData';
import { useChartFilters } from '../hooks/useChartFilters';
import { MetricDistributionBarChart, MetricDistributionPieChart } from './MetricDistributionChartVizualizations';
import Filters from '../../for_tables/Filters';
import { resumeFieldsConfig } from '../../configs/resume.config';
import { vacanciesFieldsConfig } from '../../configs/vacancies.config';
import { columnTranslations } from '../translations';
import './MetricDistributionChart.css';

const columnOptions = {
    vacancies: {
        availableColumns: [
            "salary_to", "salary_from", "russian_salary_to", "russian_salary_from",
            "min_experience", "max_experience", "bonus", "id"
        ],
        filtersConfig: vacanciesFieldsConfig
    },
    resume: {
        availableColumns: [
            "age", "salary", "russian_salary", "total_experience",
            "count_additional_courses"
        ],
        filtersConfig: resumeFieldsConfig
    }
};

export const MetricDistributionChart = ({ model = 'vacancies' }) => {
    const [column, setColumn] = useState(columnOptions[model].availableColumns[0]);
    const [numberRange, setNumberRange] = useState(5);
    const [chartType, setChartType] = useState('bar');

    const {
        filters,
        addFilter,
        removeFilter,
        clearFilters,
        getFiltersQuery
    } = useChartFilters();

    const {
        data,
        loading,
        error,
        refetch
    } = useChartData(
        '/charts/metric_distribution/',
        {},
        {
            model,
            number_range: numberRange,
            column,
            chart_type: chartType,
            filters: getFiltersQuery()
        }
    );

    useEffect(() => {
        refetch();
    }, [column, numberRange, chartType, filters]);

    const handleRangeChange = (delta) => {
        const newValue = numberRange + delta;
        if (newValue >= 2 && newValue <= 20) {
            setNumberRange(newValue);
        }
    };

    const renderChart = () => {
        if (loading) return <div className="loading">Загрузка данных...</div>;
        if (error) return <div className="error">Ошибка: {error}</div>;
        if (!data?.data?.labels?.length) return <div className="no-data">Нет данных для отображения</div>;

        const title = `Распределение по ${columnTranslations[model][column] || column}`;

        const chartProps = {
            labels: data.data.labels,
            values: data.data.values,
            title: title
        };

        switch (chartType) {
            case 'pie':
                return <MetricDistributionPieChart {...chartProps} />;
            default:
                return <MetricDistributionBarChart {...chartProps} />;
        }
    };

    return (
        <div className="metric-distribution-container">
            <div className="metric-distribution-header">
                <h2>Распределение по {columnTranslations[model][column] || column}</h2>
                <div className="metric-distribution-controls">
                    <select
                        value={column}
                        onChange={(e) => setColumn(e.target.value)}
                        className="metric-distribution-select"
                    >
                        {columnOptions[model].availableColumns.map(col => (
                            <option key={col} value={col}>
                                {columnTranslations[model][col] || col}
                            </option>
                        ))}
                    </select>

                    <div className="range-control">
                        <span>Количество диапазонов:</span>
                        <button
                            onClick={() => handleRangeChange(-1)}
                            disabled={numberRange <= 2}
                        >
                            -
                        </button>
                        <span>{numberRange}</span>
                        <button
                            onClick={() => handleRangeChange(1)}
                            disabled={numberRange >= 20}
                        >
                            +
                        </button>
                    </div>

                    <select
                        value={chartType}
                        onChange={(e) => setChartType(e.target.value)}
                        className="metric-distribution-select"
                    >
                        <option value="bar">Столбчатая</option>
                        <option value="pie">Круговая</option>
                    </select>
                </div>
            </div>

            <Filters
                filters={filters}
                onAddFilter={addFilter}
                onRemoveFilter={removeFilter}
                fieldsConfig={columnOptions[model].filtersConfig}
            />

            <div className="metric-distribution-content">
                {renderChart()}
                {data?.total_count && (
                    <div className="metric-distribution-footer">
                        Всего записей: {data.total_count}
                    </div>
                )}
            </div>
        </div>
    );
};