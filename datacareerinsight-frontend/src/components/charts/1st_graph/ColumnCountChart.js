import React, { useState, useEffect } from 'react';
import { useChartData } from '../hooks/useChartData';
import { useChartFilters } from '../hooks/useChartFilters';
import { BarChart, PieChart, ScatterChart } from './ColumnCountChartVisualizations';
import Filters from '../../for_tables/Filters';
import { resumeFieldsConfig } from '../../configs/resume.config.js';
import { vacanciesFieldsConfig } from '../../configs/vacancies.config';
import { columnTranslations, chartTitles } from '../translations';
import './ColumnCountChart.css'

const columnOptions = {
    vacancies: {
        availableColumns: [
            "title", "company_name", "currency", "experience", "type_of_employment",
            "work_format", "skills", "address", "min_experience", "max_experience",
            "salary_to", "salary_from", "russian_salary_to", "russian_salary_from",
            "bonus", "published_at", "archived", "url", "id"
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
        filtersConfig: resumeFieldsConfig
    }
};

export const ColumnCountChart = ({ model = 'vacancies' }) => {
    const [column, setColumn] = useState(columnOptions[model].availableColumns[0]);
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
        '/charts/column_count/',
        {},
        {
            model,
            column,
            chart_type: chartType,
            limit,
            filters: getFiltersQuery()
        }
    );

    useEffect(() => {
        const fetchData = async () => {
            const filtersQuery = getFiltersQuery();
            await refetch({}, {
                model,
                column,
                chart_type: chartType,
                limit,
                filters: filtersQuery
            });
        };

        fetchData();
    }, [column, chartType, limit, filters]);

    const translateLabels = (labels) => {
        if (!columnTranslations[model]) return labels;
        return labels.map(label => columnTranslations[model][label] || label);
    };

    const renderChart = () => {
        if (loading) return <div className="loading">Загрузка данных...</div>;
        if (error) return <div className="error">Ошибка: {error}</div>;

        if (!data?.data?.labels?.length || !data?.data?.values?.length) {
            return <div className="no-data">Нет данных для отображения</div>;
        }

        const chartProps = {
            labels: translateLabels(data.data.labels),
            values: data.data.values.map(Number),
            columnName: columnTranslations[model][column] || column
        };

        switch (chartType) {
            case 'pie':
                return <PieChart {...chartProps} />;
            case 'scatter':
                return <ScatterChart {...chartProps} />;
            default:
                return <BarChart {...chartProps} />;
        }
    };

    return (
        <div className="chart-container">
            <div className="chart-header">
                <h2>Распределение по {columnTranslations[model][column] || column}</h2>
                <div className="chart-controls">
                    <select
                        value={column}
                        onChange={(e) => setColumn(e.target.value)}
                        className="chart-select"
                    >
                        {columnOptions[model].availableColumns.map(col => (
                            <option key={col} value={col}>
                                {columnTranslations[model][col] || col}
                            </option>
                        ))}
                    </select>

                    <select
                        value={chartType}
                        onChange={(e) => setChartType(e.target.value)}
                        className="chart-select"
                    >
                        <option value="bar">Столбчатая диаграмма</option>
                        <option value="pie">Круговая диаграмма</option>
                        <option value="scatter">Точечная диаграмма</option>
                    </select>

                    <input
                        type="number"
                        value={limit}
                        onChange={(e) => setLimit(Math.max(1, Math.min(50, Number(e.target.value))))}
                        min="1"
                        max="50"
                        className="chart-input"
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

            <div className="chart-content">
                {renderChart()}
                {data?.total_count && (
                    <div className="chart-footer">
                        Всего записей: {data.total_count}
                    </div>
                )}
            </div>
        </div>
    );
};