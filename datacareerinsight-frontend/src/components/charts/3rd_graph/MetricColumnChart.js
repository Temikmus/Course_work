import React, { useState, useEffect } from 'react';
import { useChartData } from '../hooks/useChartData';
import { useChartFilters } from '../hooks/useChartFilters';
import { MetricColumnBarChart, MetricColumnLineChart, MetricColumnPieChart } from './MetricColumnChartVizualizations';
import Filters from '../../for_tables/Filters';
import { resumeFieldsConfig } from '../../configs/resume.config';
import { vacanciesFieldsConfig } from '../../configs/vacancies.config';
import { columnTranslations, aggregateTranslations } from '../translations';
import './MetricColumnChart.css';
import { Chart as ChartJS } from 'chart.js';

const columnOptions = {
    vacancies: {
        availableColumns: [
            "title", "company_name", "currency", "experience", "type_of_employment",
            "work_format", "skills", "address", "min_experience", "max_experience",
            "salary_to", "salary_from", "russian_salary_to", "russian_salary_from",
            "bonus", "published_at", "archived", "url", "id"
        ],
        metricColumns: [
            "salary_to", "salary_from", "russian_salary_to", "russian_salary_from",
            "min_experience", "max_experience", "bonus", "id"
        ],
        filtersConfig: vacanciesFieldsConfig
    },
    resume: {
        availableColumns: [
            "id_resume", "title", "created_at", "updated_at", "age", "gender",
            "salary", "russian_salary", "currency", "photo", "total_experience",
            "citizenship", "area", "level_education", "university", "count_additional_courses",
            "employments", "experience", "language_eng", "language_zho", "schedules",
            "skill_set", "is_driver", "professional_roles", "url"
        ],
        metricColumns: [
            "age", "salary", "russian_salary", "total_experience",
            "count_additional_courses"
        ],
        filtersConfig: resumeFieldsConfig
    }
};

export const MetricColumnChart = ({ model = 'vacancies' }) => {
    const [metricColumn, setMetricColumn] = useState(columnOptions[model].metricColumns[0]);
    const [column, setColumn] = useState(columnOptions[model].availableColumns[0]);
    const [aggregate, setAggregate] = useState('avg');
    const [chartType, setChartType] = useState('bar');
    const [limit, setLimit] = useState(10);

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
        '/charts/metric_column/',
        {},
        {
            model,
            metric_column: metricColumn,
            aggregations: aggregate,
            column,
            chart_type: chartType,
            limit,
            filters: getFiltersQuery()
        }
    );

    useEffect(() => {
        return () => {
            // Уничтожаем все чарты при размонтировании
            ChartJS.getChart('metricColumnChart')?.destroy();
        };
    }, []);

    const renderChart = () => {
        if (loading) return <div className="loading">Загрузка данных...</div>;
        if (error) return <div className="error">Ошибка: {error}</div>;
        if (!data?.data?.labels?.length) return <div className="no-data">Нет данных для отображения</div>;

        const translatedAggregate = aggregateTranslations[aggregate] || aggregate;
        const title = `${columnTranslations[model][metricColumn] || metricColumn} (${translatedAggregate})`;

        const chartProps = {
            labels: data.data.labels.map(label => String(label)), // Преобразуем в строки
            values: data.data.values,
            countValues: data.data.count_values,
            title: title
        };

        switch (chartType) {
            case 'line':
                return <MetricColumnLineChart {...chartProps} />;
            case 'pie':
                return <MetricColumnPieChart {...chartProps} />;
            default:
                return <MetricColumnBarChart {...chartProps} />;
        }
    };


    return (
        <div className="metric-column-container" id="metricColumnChart">
            <div className="metric-column-header">
                <h2>
                    {columnTranslations[model][metricColumn] || metricColumn} по {columnTranslations[model][column] || column}
                </h2>
                <div className="metric-column-controls">
                    <select
                        value={metricColumn}
                        onChange={(e) => setMetricColumn(e.target.value)}
                        className="metric-column-select"
                    >
                        {columnOptions[model].metricColumns.map(col => (
                            <option key={col} value={col}>
                                {columnTranslations[model][col] || col}
                            </option>
                        ))}
                    </select>

                    <select
                        value={column}
                        onChange={(e) => setColumn(e.target.value)}
                        className="metric-column-select"
                    >
                        {columnOptions[model].availableColumns.map(col => (
                            <option key={col} value={col}>
                                {columnTranslations[model][col] || col}
                            </option>
                        ))}
                    </select>

                    <select
                        value={aggregate}
                        onChange={(e) => setAggregate(e.target.value)}
                        className="metric-column-select"
                    >
                        {['avg', 'sum', 'max', 'min', 'median'].map(agg => (
                            <option key={agg} value={agg}>
                                {aggregateTranslations[agg] || agg}
                            </option>
                        ))}
                    </select>

                    <select
                        value={chartType}
                        onChange={(e) => setChartType(e.target.value)}
                        className="metric-column-select"
                    >
                        <option value="bar">Столбчатая</option>
                        <option value="line">Линейная</option>
                        <option value="pie">Круговая</option>
                    </select>

                    <input
                        type="number"
                        value={limit}
                        onChange={(e) => setLimit(Math.max(1, Math.min(50, Number(e.target.value))))}
                        min="1"
                        max="50"
                        className="metric-column-input"
                        placeholder="Лимит"
                    />
                </div>
            </div>

            <Filters
                filters={filters}
                onAddFilter={addFilter}
                onRemoveFilter={removeFilter}
                fieldsConfig={columnOptions[model].filtersConfig}
            />

            <div className="metric-column-content">
                {renderChart()}
                {data?.total_count && (
                    <div className="metric-column-footer">
                        Всего записей: {data.total_count}
                    </div>
                )}
            </div>
        </div>
    );
};