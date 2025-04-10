import React, { useState, useEffect } from 'react';
import { useChartData } from '../hooks/useChartData';
import { useChartFilters } from '../hooks/useChartFilters';
import { MetricColumnBarChart, MetricColumnLineChart, MetricColumnPieChart } from './MetricColumnChartVizualizations';
import Filters from '../../for_tables/Filters';
import { resumeFieldsConfig } from '../../configs/resume.config';
import { vacanciesFieldsConfig } from '../../configs/vacancies.config';
import { columnTranslations, aggregateTranslations } from '../translations';
import {
    Box,
    Card,
    CardContent,
    CardHeader,
    CircularProgress,
    Container,
    FormControl,
    Grid,
    InputLabel,
    MenuItem,
    Select,
    Typography,
    IconButton,
    Tooltip
} from '@mui/material';
import {
    Refresh as RefreshIcon,
    BarChart as BarChartIcon,
    ShowChart as LineChartIcon,
    PieChart as PieChartIcon,
    Info as InfoIcon,
    Functions as AggregationIcon,
    Category as CategoryIcon
} from '@mui/icons-material';
import * as PropTypes from "prop-types";

const columnOptions = {
    vacancies: {
        availableColumns: [
            "type_of_employment", "title", "company_name", "currency", "experience",
            "work_format", "skills", "address", "min_experience", "max_experience",
            "salary_to", "salary_from", "russian_salary_to", "russian_salary_from",
            "published_at", "archived"
        ],
        metricColumns: [
            "russian_salary_to", "salary_to", "salary_from",  "russian_salary_from",
            "min_experience", "max_experience"
        ],
        filtersConfig: vacanciesFieldsConfig
    },
    resume: {
        availableColumns: [
            "employments", "title", "created_at", "updated_at", "age", "gender",
            "salary", "russian_salary", "currency", "photo", "total_experience",
            "citizenship", "area", "level_education", "university", "count_additional_courses",
            "experience", "language_eng", "language_zho", "schedules",
            "skill_set", "is_driver", "professional_roles"
        ],
        metricColumns: [
            "russian_salary", "age", "salary",  "total_experience",
            "count_additional_courses"
        ],
        filtersConfig: resumeFieldsConfig
    }
};

const modelColors = {
    vacancies: {
        primary: '#8bbaf0',      // Светлый цвет из градиента (было #5d9cec)
        contrastText: '#ffffff'  // Белый текст
    },
    resume: {
        primary: '#b39ddb',      // Фиолетовый для резюме
        contrastText: '#ffffff'
    }
};

function FunctionsIcon(props) {
    return null;
}

FunctionsIcon.propTypes = {
    fontSize: PropTypes.string,
    sx: PropTypes.shape({mr: PropTypes.number})
};

export const MetricColumnChart = ({ model = 'vacancies' }) => {
    const [metricColumn, setMetricColumn] = useState(columnOptions[model].metricColumns[0]);
    const [column, setColumn] = useState(columnOptions[model].availableColumns[0]);
    const [aggregate, setAggregate] = useState('avg');
    const [chartType, setChartType] = useState('pie');
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

    const renderChart = () => {
        if (loading) return (
            <Box display="flex" justifyContent="center" alignItems="center" height="300px">
                <CircularProgress />
            </Box>
        );

        if (error) return (
            <Box p={2} textAlign="center" color="error.main">
                Ошибка: {error}
            </Box>
        );

        if (!data?.data?.labels?.length) return (
            <Box p={2} textAlign="center">
                Нет данных для отображения
            </Box>
        );

        const translatedAggregate = aggregateTranslations[aggregate] || aggregate;
        const title = `${columnTranslations[model][metricColumn] || metricColumn} (${translatedAggregate})`;

        const chartProps = {
            labels: data.data.labels.map(label => String(label)),
            values: data.data.values,
            countValues: data.data.count_values,
            title: title,
            model: model
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
        <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
            <Card sx={{
                border: `2px solid ${modelColors[model].primary}`,
                borderRadius: '8px',
                boxShadow: 3
            }}>
                <CardHeader
                    title={
                        <Box display="flex" alignItems="center">
                            <Typography variant="h6" component="div" sx={{ color: modelColors[model].contrastText }}>
                                Сравнение выбранного показателя по заданному признаку
                            </Typography>
                            <Tooltip
                                title="На графике отображается агрегированное значение выбранного метрики (например, средняя зарплата, максимальный опыт и т.д.) по группирующему признаку (например, название вакансии, адрес, скиллы и т.д.)"
                                arrow
                                placement="right"
                            >
                                <IconButton size="small" sx={{ ml: 1, color: modelColors[model].contrastText }}>
                                    <InfoIcon fontSize="small" />
                                </IconButton>
                            </Tooltip>
                        </Box>
                    }
                    subheader={
                        <Typography variant="subtitle1" sx={{ color: modelColors[model].contrastText, opacity: 0.9 }}>
                            {columnTranslations[model][metricColumn] || metricColumn} по {columnTranslations[model][column] || column}
                        </Typography>
                    }
                    action={
                        <IconButton onClick={clearFilters} sx={{ color: modelColors[model].contrastText }}>
                            <RefreshIcon />
                        </IconButton>
                    }
                    sx={{
                        backgroundColor: modelColors[model].primary,
                        '& .MuiCardHeader-title': {
                            fontWeight: 600,
                            fontSize: '1.25rem'
                        },
                        '& .MuiCardHeader-subheader': {
                            opacity: 0.9
                        }
                    }}
                />

                <CardContent>
                    <Grid container spacing={2} sx={{ mb: 2 }}>
                        {/* Метрика для анализа */}
                        <Grid item xs={12} md={3}>
                            <FormControl fullWidth size="small">
                                <InputLabel>
                                    <Box display="flex" alignItems="center">
                                        <FunctionsIcon fontSize="small" sx={{ mr: 0.5 }} />
                                        Показатель
                                    </Box>
                                </InputLabel>
                                <Select
                                    value={metricColumn}
                                    onChange={(e) => setMetricColumn(e.target.value)}
                                    label={
                                        <Box display="flex" alignItems="center">
                                            <FunctionsIcon fontSize="small" sx={{ mr: 0.5 }} />
                                            Показатель
                                        </Box>
                                    }
                                >
                                    {columnOptions[model].metricColumns.map(col => (
                                        <MenuItem key={col} value={col}>
                                            {columnTranslations[model][col] || col}
                                        </MenuItem>
                                    ))}
                                </Select>
                            </FormControl>
                        </Grid>

                        {/* Агрегация */}
                        <Grid item xs={12} md={2}>
                            <FormControl fullWidth size="small">
                                <InputLabel>Агрегация</InputLabel>
                                <Select
                                    value={aggregate}
                                    onChange={(e) => setAggregate(e.target.value)}
                                    label="Агрегация"
                                >
                                    {['avg', 'sum', 'max', 'min', 'median'].map(agg => (
                                        <MenuItem key={agg} value={agg}>
                                            {aggregateTranslations[agg] || agg}
                                        </MenuItem>
                                    ))}
                                </Select>
                            </FormControl>
                        </Grid>

                        {/* Группирующий признак */}
                        <Grid item xs={12} md={3}>
                            <FormControl fullWidth size="small">
                                <InputLabel>
                                    <Box display="flex" alignItems="center">
                                        <CategoryIcon fontSize="small" sx={{ mr: 0.5 }} />
                                        Признак
                                    </Box>
                                </InputLabel>
                                <Select
                                    value={column}
                                    onChange={(e) => setColumn(e.target.value)}
                                    label={
                                        <Box display="flex" alignItems="center">
                                            <CategoryIcon fontSize="small" sx={{ mr: 0.5 }} />
                                            Признак
                                        </Box>
                                    }
                                >
                                    {columnOptions[model].availableColumns.map(col => (
                                        <MenuItem key={col} value={col}>
                                            {columnTranslations[model][col] || col}
                                        </MenuItem>
                                    ))}
                                </Select>
                            </FormControl>
                        </Grid>

                        {/* Тип графика */}
                        <Grid item xs={12} md={2}>
                            <FormControl fullWidth size="small">
                                <InputLabel>Тип графика</InputLabel>
                                <Select
                                    value={chartType}
                                    onChange={(e) => setChartType(e.target.value)}
                                    label="Тип графика"
                                >
                                    <MenuItem value="bar">
                                        <Box display="flex" alignItems="center">
                                            <BarChartIcon sx={{ mr: 1 }} />
                                            Столбчатая
                                        </Box>
                                    </MenuItem>
                                    <MenuItem value="line">
                                        <Box display="flex" alignItems="center">
                                            <LineChartIcon sx={{ mr: 1 }} />
                                            Линейная
                                        </Box>
                                    </MenuItem>
                                    <MenuItem value="pie">
                                        <Box display="flex" alignItems="center">
                                            <PieChartIcon sx={{ mr: 1 }} />
                                            Круговая
                                        </Box>
                                    </MenuItem>
                                </Select>
                            </FormControl>
                        </Grid>

                        {/* Лимит */}
                        <Grid item xs={12} md={2}>
                            <FormControl fullWidth size="small">
                                <InputLabel>Лимит</InputLabel>
                                <Select
                                    value={limit}
                                    onChange={(e) => setLimit(e.target.value)}
                                    label="Лимит"
                                >
                                    {[5, 10, 15, 20, 25, 50].map(num => (
                                        <MenuItem key={num} value={num}>
                                            {num} значений
                                        </MenuItem>
                                    ))}
                                </Select>
                            </FormControl>
                        </Grid>
                    </Grid>

                    <Filters
                        filters={filters}
                        onAddFilter={addFilter}
                        onRemoveFilter={removeFilter}
                        fieldsConfig={columnOptions[model].filtersConfig}
                    />

                    <Box sx={{ height: 400, mt: 2 }}>
                        {renderChart()}
                    </Box>

                    {data?.total_count && (
                        <Box sx={{ mt: 2, textAlign: 'center' }}>
                            <Typography variant="body2" color="text.secondary">
                                Всего записей: {data.total_count}
                            </Typography>
                        </Box>
                    )}
                </CardContent>
            </Card>
        </Container>
    );
};