import React, { useState, useEffect } from 'react';
import { useChartData } from '../hooks/useChartData';
import { useChartFilters } from '../hooks/useChartFilters';
import { BarChart, PieChart, ScatterChart } from './ColumnCountChartVisualizations';
import Filters from '../../for_tables/Filters';
import { resumeFieldsConfig } from '../../configs/resume.config.js';
import { vacanciesFieldsConfig } from '../../configs/vacancies.config';
import { columnTranslations } from '../translations';
import {
    Box,
    Card,
    CardContent,
    CardHeader,
    CircularProgress,
    Container,
    Divider,
    FormControl,
    Grid,
    InputLabel,
    MenuItem,
    Paper,
    Select,
    Typography,
    IconButton,
    Tooltip
} from '@mui/material';
import {
    Refresh as RefreshIcon,
    BarChart as BarChartIcon,
    PieChart as PieChartIcon,
    ScatterPlot as ScatterPlotIcon,
    Info as InfoIcon
} from '@mui/icons-material';

const columnOptions = {
    vacancies: {
        availableColumns: [
            "skills","title", "company_name", "currency", "experience", "type_of_employment",
            "work_format",  "address", "min_experience", "max_experience",
            "salary_to", "salary_from", "russian_salary_to", "russian_salary_from",
            "published_at", "archived", "url", "id"
        ],
        filtersConfig: vacanciesFieldsConfig
    },
    resume: {
        availableColumns: [
            "skill_set", "id_resume", "title", "created_at", "updated_at", "age", "gender",
            "salary", "russian_salary", "currency", "photo", "total_experience",
            "citizenship", "area", "level_education", "university", "count_additional_courses",
            "employments", "experience", "language_eng", "language_zho", "schedules",
            "is_driver", "professional_roles", "url"
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

export const ColumnCountChart = ({ model = 'vacancies' }) => {
    const [column, setColumn] = useState(columnOptions[model].availableColumns[0]);
    const [chartType, setChartType] = useState('bar');
    const [limit, setLimit] = useState(15);

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

        if (!data?.data?.labels?.length || !data?.data?.values?.length) {
            return (
                <Box p={2} textAlign="center">
                    Нет данных для отображения
                </Box>
            );
        }

        const chartProps = {
            labels: translateLabels(data.data.labels),
            values: data.data.values.map(Number),
            columnName: columnTranslations[model][column] || column,
            model
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
                                Количественное распределение
                            </Typography>
                            <Tooltip
                                title="На данном графике вы можете выбрать столбец, чтобы получить количество наблюдений по каждому значению этого столбца. Берутся первые 'Лимит' значений по количеству."
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
                            По столбцу: {columnTranslations[model][column] || column}
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
                                    onChange={(e) => setColumn(e.target.value)}
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
                                            Столбчатая диаграмма
                                        </Box>
                                    </MenuItem>
                                    <MenuItem value="pie">
                                        <Box display="flex" alignItems="center">
                                            <PieChartIcon sx={{ mr: 1 }} />
                                            Круговая диаграмма
                                        </Box>
                                    </MenuItem>
                                    <MenuItem value="scatter">
                                        <Box display="flex" alignItems="center">
                                            <ScatterPlotIcon sx={{ mr: 1 }} />
                                            Точечная диаграмма
                                        </Box>
                                    </MenuItem>
                                </Select>
                            </FormControl>
                        </Grid>

                        <Grid item xs={12} md={4}>
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