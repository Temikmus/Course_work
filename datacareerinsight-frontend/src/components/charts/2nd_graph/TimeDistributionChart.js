import React, { useState, useEffect } from 'react';
import { useChartData } from '../hooks/useChartData';
import { useChartFilters } from '../hooks/useChartFilters';
import { TimeBarChart, TimeLineChart, TimeScatterChart } from './TimeDistributionChartVizualizations';
import Filters from '../../for_tables/Filters';
import { resumeFieldsConfig } from '../../configs/resume.config';
import { vacanciesFieldsConfig } from '../../configs/vacancies.config';
import { columnTranslations, aggregateTranslations } from '../translations';
import './TimeDistributionChart.css';


const columnOptions = {
    vacancies: {
        availableColumns: [
            "skills", "company_name", "work_format", "type_of_employment",
            "salary_to", "salary_from", "russian_salary_to", "russian_salary_from",
            "min_experience", "max_experience", "bonus", "id"
        ],
        numericColumns: [
            "salary_to", "salary_from", "russian_salary_to", "russian_salary_from",
            "min_experience", "max_experience", "bonus", "id"
        ],
        filtersConfig: vacanciesFieldsConfig,
        timeColumn: 'published_at'
    },
    resume: {
        availableColumns: [
            "skill_set", "professional_roles", "employments",
            "age", "salary", "russian_salary", "total_experience",
            "count_additional_courses"
        ],
        numericColumns: [
            "age", "salary", "russian_salary", "total_experience",
            "count_additional_courses"
        ],
        filtersConfig: resumeFieldsConfig,
        timeColumn: 'updated_at'
    }
};

export const TimeDistributionChart = ({ model = 'vacancies' }) => {
    const [column, setColumn] = useState(columnOptions[model].availableColumns[0]);
    const [aggregate, setAggregate] = useState(null);
    const [chartType, setChartType] = useState('line');
    const isNumeric = columnOptions[model].numericColumns.includes(column);

    const {
        filters,
        addFilter,
        removeFilter,
        clearFilters,
        getFiltersQuery
    } = useChartFilters();

    const getAvailableAggregates = () => {
        return isNumeric
            ? ['avg', 'sum', 'max', 'min', 'median', 'mode']
            : ['mode'];
    };

    const availableAggregates = getAvailableAggregates();

    const {
        data,
        loading,
        error,
        refetch
    } = useChartData(
        '/charts/time_distribution/',
        {},
        {
            model,
            column,
            aggregates: aggregate,
            chart_type: chartType,
            filters: getFiltersQuery()
        },
        !!aggregate
    );

    useEffect(() => {
        if (availableAggregates.length > 0 && !aggregate) {
            setAggregate(availableAggregates[0]);
        }
    }, [column, availableAggregates]);

    const handleColumnChange = (newColumn) => {
        setColumn(newColumn);
        setAggregate(null);
    };

    const renderChart = () => {
        if (!aggregate) return <div className="no-data">Выберите агрегацию</div>;
        if (loading) return <div className="loading">Загрузка данных...</div>;
        if (error) return <div className="error">Ошибка: {error}</div>;
        if (!data?.data?.labels?.length) return <div className="no-data">Нет данных для отображения</div>;

        const translatedAggregate = aggregateTranslations[aggregate] || aggregate;
        const title = `${columnTranslations[model][column] || column} (${translatedAggregate})`;

        const chartProps = {
            labels: data.data.labels,
            values: data.data.values,
            countValues: data.data.count_values,
            title: title,
            isNumeric: isNumeric,
            modeValues: !isNumeric ? data.data.values : null
        };

        switch (chartType) {
            case 'bar':
                return <TimeBarChart {...chartProps} />;
            case 'scatter':
                return <TimeScatterChart {...chartProps} />;
            default:
                return <TimeLineChart {...chartProps} />;
        }
    };

    return (
        <div className="time-chart-container">
            <div className="time-chart-header">
                <h2>Динамика {columnTranslations[model][column] || column}</h2>
                <div className="time-chart-controls">
                    <select
                        value={column}
                        onChange={(e) => handleColumnChange(e.target.value)}
                        className="time-chart-select"
                    >
                        {columnOptions[model].availableColumns.map(col => (
                            <option key={col} value={col}>
                                {columnTranslations[model][col] || col}
                            </option>
                        ))}
                    </select>

                    <select
                        value={aggregate || ''}
                        onChange={(e) => setAggregate(e.target.value)}
                        className="time-chart-select"
                        disabled={availableAggregates.length === 0}
                    >

                        {availableAggregates.map(agg => (
                            <option key={agg} value={agg}>
                                {aggregateTranslations[agg] || agg}
                            </option>
                        ))}
                    </select>

                    <select
                        value={chartType}
                        onChange={(e) => setChartType(e.target.value)}
                        className="time-chart-select"
                    >
                        <option value="line">Линейный</option>
                        <option value="bar">Столбчатый</option>
                        <option value="scatter">Точечный</option>
                    </select>
                </div>
            </div>

            <Filters
                filters={filters}
                onAddFilter={addFilter}
                onRemoveFilter={removeFilter}
                fieldsConfig={columnOptions[model].filtersConfig}
            />

            <div className="time-chart-content">
                {renderChart()}
                {data?.total_count && (
                    <div className="time-chart-footer">
                        Всего периодов: {data.total_count}
                    </div>
                )}
            </div>
        </div>
    );
};