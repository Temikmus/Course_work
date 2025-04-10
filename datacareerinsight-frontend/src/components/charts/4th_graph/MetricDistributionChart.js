import React, { useState, useEffect } from 'react';
import { useChartData } from '../hooks/useChartData';
import { useChartFilters } from '../hooks/useChartFilters';
import { MetricDistributionBarChart, MetricDistributionPieChart } from './MetricDistributionChartVizualizations';
import Filters from '../../for_tables/Filters';
import { resumeFieldsConfig } from '../../configs/resume.config';
import { vacanciesFieldsConfig } from '../../configs/vacancies.config';
import { columnTranslations } from '../translations';
import {
    Box,
    Button,
    Card,
    CardContent,
    CardHeader,
    CircularProgress,
    Container,
    FormControl,
    Grid,
    IconButton,
    InputLabel,
    MenuItem,
    Select,
    Typography,
    Tooltip, Paper
} from '@mui/material';
import {
    Refresh as RefreshIcon,
    BarChart as BarChartIcon,
    PieChart as PieChartIcon,
    Info as InfoIcon,
    Remove as RemoveIcon,
    Add as AddIcon
} from '@mui/icons-material';

const columnOptions = {
    vacancies: {
        availableColumns: [
            "russian_salary_from", "salary_to", "salary_from", "russian_salary_to",
            "min_experience", "max_experience"
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

export const MetricDistributionChart = ({ model = 'vacancies' }) => {
    const [column, setColumn] = useState(columnOptions[model].availableColumns[0]);
    const [numberRange, setNumberRange] = useState(9);
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

        const title = `Распределение по ${columnTranslations[model][column] || column}`;

        const chartProps = {
            labels: data.data.labels,
            values: data.data.values,
            title: title,
            model: model
        };

        switch (chartType) {
            case 'pie':
                return <MetricDistributionPieChart {...chartProps} />;
            default:
                return <MetricDistributionBarChart {...chartProps} />;
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
                                Распределение значений по диапазонам
                            </Typography>
                            <Tooltip
                                title="На графике отображается количество наблюдений, попадающих в выбранные интервалы значений для заданного числового столбца"
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
                        {/* Выбор столбца */}
                        <Grid item xs={12} md={4}>
                            <FormControl fullWidth size="small">
                                <InputLabel>Числовой столбец</InputLabel>
                                <Select
                                    value={column}
                                    onChange={(e) => setColumn(e.target.value)}
                                    label="Числовой столбец"
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
                                            Столбчатая
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

                        {/* Управление диапазонами */}
                        <Grid item xs={12} md={4}>
                            <Paper
                                variant="outlined"
                                sx={{
                                    p: 1,
                                    display: 'flex',
                                    alignItems: 'center',
                                    height: '46%',
                                    justifyContent: 'space-between'
                                }}
                            >
                                <Typography variant="body2" sx={{
                                    ml: 0,
                                    whiteSpace: 'nowrap',
                                    minWidth: '180px',
                                    textAlign: 'center'
                                }}>
                                    Количество диапазонов:
                                </Typography>
                                <Box display="flex" alignItems="center">
                                    <IconButton
                                        onClick={() => handleRangeChange(-1)}
                                        disabled={numberRange <= 2}
                                        size="small"
                                        sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 1 }}
                                    >
                                        <RemoveIcon fontSize="small" />
                                    </IconButton>
                                    <Typography
                                        variant="body1"
                                        sx={{
                                            mx: 1.5,
                                            minWidth: '24px',
                                            textAlign: 'center',
                                            px: 1,
                                            py: 0.5,
                                            bgcolor: 'action.hover',
                                            borderRadius: 1
                                        }}
                                    >
                                        {numberRange}
                                    </Typography>
                                    <IconButton
                                        onClick={() => handleRangeChange(1)}
                                        disabled={numberRange >= 20}
                                        size="small"
                                        sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 1 }}
                                    >
                                        <AddIcon fontSize="small" />
                                    </IconButton>
                                </Box>
                            </Paper>
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
                </CardContent>
            </Card>
        </Container>
    );
};