import React, { useState, useEffect } from 'react';
import { useChartData } from '../hooks/useChartData';
import { useChartFilters } from '../hooks/useChartFilters';
import { TimeBarChart, TimeLineChart, TimeScatterChart } from './TimeDistributionChartVizualizations';
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
    ShowChart as LineChartIcon,
    BarChart as BarChartIcon,
    ScatterPlot as ScatterPlotIcon,
    Info as InfoIcon,
    Timeline as TimelineIcon
} from '@mui/icons-material';

const columnOptions = {
    vacancies: {
        availableColumns: [
            "russian_salary_from", "title", "company_name", "currency", "experience", "type_of_employment",
            "work_format", "skills", "address", "min_experience", "max_experience",
            "salary_to", "salary_from", "russian_salary_to",
            "published_at", "archived", "url", "id"
        ],
        numericColumns: [
            "salary_to", "salary_from", "russian_salary_to", "russian_salary_from",
            "min_experience", "max_experience", "id"
        ],
        filtersConfig: vacanciesFieldsConfig,
        timeColumn: 'published_at'
    },
    resume: {
        availableColumns: [
            "russian_salary","id_resume", "title", "created_at", "updated_at", "age", "gender",
            "salary",  "currency", "photo", "total_experience",
            "citizenship", "area", "level_education", "university", "count_additional_courses",
            "employments", "experience", "language_eng", "language_zho", "schedules",
            "skill_set", "is_driver", "professional_roles", "url"
        ],
        numericColumns: [
            "age", "salary", "russian_salary", "total_experience",
            "count_additional_courses"
        ],
        filtersConfig: resumeFieldsConfig,
        timeColumn: 'updated_at'
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

export const TimeDistributionChart = ({ model = 'vacancies' }) => {
    const [column, setColumn] = useState(columnOptions[model].availableColumns[0]);
    const [aggregate, setAggregate] = useState('avg');
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
            ? ['avg', 'sum', 'max', 'min', 'median', 'mode', 'stddev', 'variance']
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
        if (!aggregate) return (
            <Box p={2} textAlign="center">
                Выберите агрегацию
            </Box>
        );

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
        const title = `${columnTranslations[model][column] || column} (${translatedAggregate})`;

        const chartProps = {
            labels: data.data.labels,
            values: data.data.values,
            countValues: data.data.count_values,
            title: title,
            isNumeric: isNumeric,
            modeValues: !isNumeric ? data.data.values : null,
            model: model
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
                                Распределение по времени
                            </Typography>
                            <Tooltip
                                title="На данном графике вы можете посмотреть среднее/максимальное и т.д. значение для определенного столбца с течением времени"
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
                            Анализ столбца: {columnTranslations[model][column] || column}
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
                        <Grid item xs={12} md={4}>
                            <FormControl fullWidth size="small">
                                <InputLabel>Столбец</InputLabel>
                                <Select
                                    value={column}
                                    onChange={(e) => handleColumnChange(e.target.value)}
                                    label="Столбец"
                                >
                                    {columnOptions[model].availableColumns.map(col => (
                                        <MenuItem key={col} value={col}>
                                            {columnTranslations[model][col] || col}
                                        </MenuItem>
                                    ))}
                                </Select>
                            </FormControl>
                        </Grid>

                        <Grid item xs={12} md={4}>
                            <FormControl fullWidth size="small" disabled={availableAggregates.length === 0}>
                                <InputLabel>Агрегация</InputLabel>
                                <Select
                                    value={aggregate || ''}
                                    onChange={(e) => setAggregate(e.target.value)}
                                    label="Агрегация"
                                >
                                    {availableAggregates.map(agg => (
                                        <MenuItem key={agg} value={agg}>
                                            {aggregateTranslations[agg] || agg}
                                        </MenuItem>
                                    ))}
                                </Select>
                            </FormControl>
                        </Grid>

                        <Grid item xs={12} md={4}>
                            <FormControl fullWidth size="small">
                                <InputLabel>Тип графика</InputLabel>
                                <Select
                                    value={chartType}
                                    onChange={(e) => setChartType(e.target.value)}
                                    label="Тип графика"
                                >
                                    <MenuItem value="line">
                                        <Box display="flex" alignItems="center">
                                            <LineChartIcon sx={{ mr: 1 }} />
                                            Линейный
                                        </Box>
                                    </MenuItem>
                                    <MenuItem value="bar">
                                        <Box display="flex" alignItems="center">
                                            <BarChartIcon sx={{ mr: 1 }} />
                                            Столбчатый
                                        </Box>
                                    </MenuItem>
                                    <MenuItem value="scatter">
                                        <Box display="flex" alignItems="center">
                                            <ScatterPlotIcon sx={{ mr: 1 }} />
                                            Точечный
                                        </Box>
                                    </MenuItem>
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
                                Всего периодов: {data.total_count}
                            </Typography>
                        </Box>
                    )}
                </CardContent>
            </Card>
        </Container>
    );
};