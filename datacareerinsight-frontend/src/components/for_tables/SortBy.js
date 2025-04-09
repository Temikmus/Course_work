import React, { useState, useEffect } from "react";
import {
    Accordion,
    AccordionSummary,
    AccordionDetails,
    Box,
    Button,
    Chip,
    Divider,
    FormControl,
    Grid,
    InputLabel,
    MenuItem,
    Paper,
    Select,
    Stack,
    Typography
} from '@mui/material';
import {
    Add as AddIcon,
    Close as CloseIcon,
    ExpandMore as ExpandMoreIcon,
    Sort as SortIcon
} from '@mui/icons-material';

const SortBy = ({
                    columns,
                    onApplySortBy,
                    sortBy,
                    fieldsConfig = {
                        fields: [],
                        numericAggregations: [],
                        nonNumericAggregations: [],
                        dateAggregations: []
                    }
                }) => {
    const [selectedColumn, setSelectedColumn] = useState("");
    const [sortOrder, setSortOrder] = useState("asc");
    const [sortConditions, setSortConditions] = useState([]);
    const [expanded, setExpanded] = useState(false);

    const {
        fields = [],
        numericAggregations = [],
        nonNumericAggregations = [],
        dateAggregations = []
    } = fieldsConfig;

    useEffect(() => {
        if (sortBy) {
            setSortConditions(sortBy.split(","));
        } else {
            setSortConditions([]);
        }
    }, [sortBy]);

    // Получение всех агрегаций
    const getAllAggregations = () => {
        return [...numericAggregations, ...nonNumericAggregations, ...dateAggregations];
    };

    // Проверка, является ли столбец агрегированным
    const isAggregatedColumn = (column) => {
        return column.includes("_") &&
            getAllAggregations().some(agg => column.endsWith(`_${agg.value}`));
    };

    // Форматирование агрегированного столбца
    const formatAggregatedColumn = (column) => {
        const lastUnderscoreIndex = column.lastIndexOf("_");
        if (lastUnderscoreIndex !== -1) {
            const columnName = column.slice(0, lastUnderscoreIndex);
            const aggregation = column.slice(lastUnderscoreIndex + 1);
            return `${columnName}:${aggregation}`;
        }
        return column;
    };

    // Получение перевода названия поля
    const getFieldLabel = (fieldValue) => {
        const fieldObj = fields.find(f => f.value === fieldValue);
        return fieldObj ? fieldObj.label : fieldValue;
    };

    // Получение перевода агрегации
    const getAggregationLabel = (aggValue) => {
        const allAggregations = getAllAggregations();
        const aggObj = allAggregations.find(a => a.value === aggValue);
        return aggObj ? aggObj.label : aggValue;
    };

    // Форматирование отображения столбца для интерфейса
    const formatColumnDisplay = (column) => {
        if (isAggregatedColumn(column)) {
            const lastUnderscoreIndex = column.lastIndexOf("_");
            const field = column.slice(0, lastUnderscoreIndex);
            const aggregation = column.slice(lastUnderscoreIndex + 1);

            const fieldLabel = getFieldLabel(field);
            const aggLabel = getAggregationLabel(aggregation);

            return `${fieldLabel} (${aggLabel})`;
        }
        return getFieldLabel(column);
    };

    // Форматирование отображения условия сортировки
    const formatSortCondition = (condition) => {
        const [column, order] = condition.split(":");
        const isAggregated = column.includes(":");

        if (isAggregated) {
            const [field, aggregation] = column.split(":");
            const fieldLabel = getFieldLabel(field);
            const aggLabel = getAggregationLabel(aggregation);
            return `${fieldLabel} (${aggLabel}) ${order === 'asc' ? '↑' : '↓'}`;
        }

        return `${getFieldLabel(column)} ${order === 'asc' ? '↑' : '↓'}`;
    };

    const handleAddSortCondition = () => {
        if (selectedColumn) {
            const isAggregated = isAggregatedColumn(selectedColumn);
            const formattedColumn = isAggregated
                ? formatAggregatedColumn(selectedColumn)
                : selectedColumn;
            const sortCondition = `${formattedColumn}:${sortOrder}`;
            const updatedSortConditions = [...sortConditions, sortCondition];
            setSortConditions(updatedSortConditions);
            setSelectedColumn("");
            onApplySortBy(updatedSortConditions.join(","));
        }
    };

    const handleRemoveSortCondition = (index) => {
        const updatedSortConditions = sortConditions.filter((_, i) => i !== index);
        setSortConditions(updatedSortConditions);
        onApplySortBy(updatedSortConditions.join(","));
    };

    const handleClearAll = () => {
        setSortConditions([]);
        onApplySortBy("");
    };

    return (
        <Paper elevation={2} sx={{ mb: 2 }}>
            <Accordion expanded={expanded} onChange={() => setExpanded(!expanded)}>
                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                    <Typography variant="subtitle1">Сортировка</Typography>
                    {sortConditions.length > 0 && (
                        <Chip
                            label={sortConditions.length}
                            size="small"
                            color="primary"
                            sx={{ ml: 1 }}
                        />
                    )}
                </AccordionSummary>

                <AccordionDetails>
                    {/* Активные условия сортировки */}
                    {sortConditions.length > 0 && (
                        <Box sx={{ mb: 2 }}>
                            <Typography variant="body2" color="text.secondary" gutterBottom>
                                Активные условия сортировки:
                            </Typography>
                            <Stack direction="row" spacing={1} flexWrap="wrap">
                                {sortConditions.map((condition, index) => (
                                    <Chip
                                        key={index}
                                        label={formatSortCondition(condition)}
                                        onDelete={() => handleRemoveSortCondition(index)}
                                        deleteIcon={<CloseIcon />}
                                        variant="outlined"
                                        size="small"
                                    />
                                ))}
                            </Stack>
                            <Divider sx={{ my: 2 }} />
                        </Box>
                    )}

                    {/* Форма добавления сортировки */}
                    <Grid container spacing={2} alignItems="flex-end">
                        {/* Выбор столбца */}
                        <Grid item xs={12} sm={6}>
                            <FormControl fullWidth size="medium" sx={{ minWidth: 200 }}>
                                <InputLabel>Столбец</InputLabel>
                                <Select
                                    value={selectedColumn}
                                    onChange={(e) => setSelectedColumn(e.target.value)}
                                    label="Столбец"
                                    MenuProps={{
                                        PaperProps: {
                                            style: {
                                                maxHeight: 400,
                                                width: 350,
                                            },
                                        },
                                    }}
                                >
                                    <MenuItem value="">
                                        <em>Выберите столбец</em>
                                    </MenuItem>
                                    {columns.map((column) => (
                                        <MenuItem
                                            key={column}
                                            value={column}
                                            sx={{
                                                whiteSpace: 'normal',
                                                wordBreak: 'break-word'
                                            }}
                                        >
                                            {formatColumnDisplay(column)}
                                        </MenuItem>
                                    ))}
                                </Select>
                            </FormControl>
                        </Grid>

                        {/* Направление сортировки */}
                        <Grid item xs={12} sm={3}>
                            <FormControl fullWidth size="medium">
                                <InputLabel>Направление</InputLabel>
                                <Select
                                    value={sortOrder}
                                    onChange={(e) => setSortOrder(e.target.value)}
                                    label="Направление"
                                >
                                    <MenuItem value="asc">По возрастанию</MenuItem>
                                    <MenuItem value="desc">По убыванию</MenuItem>
                                </Select>
                            </FormControl>
                        </Grid>

                        {/* Кнопка добавления */}
                        <Grid item xs={12} sm={3}>
                            <Button
                                fullWidth
                                variant="contained"
                                startIcon={<AddIcon />}
                                onClick={handleAddSortCondition}
                                disabled={!selectedColumn}
                                sx={{
                                    height: '44px',
                                    whiteSpace: 'nowrap'
                                }}
                            >
                                Добавить
                            </Button>
                        </Grid>
                    </Grid>

                    {sortConditions.length > 0 && (
                        <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
                            <Button
                                variant="outlined"
                                color="error"
                                onClick={handleClearAll}
                            >
                                Очистить все
                            </Button>
                        </Box>
                    )}
                </AccordionDetails>
            </Accordion>
        </Paper>
    );
};

export default SortBy;