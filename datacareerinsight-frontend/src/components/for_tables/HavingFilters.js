import React, { useState } from "react";
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
    TextField,
    Typography
} from '@mui/material';
import {
    Add as AddIcon,
    Close as CloseIcon,
    ExpandMore as ExpandMoreIcon
} from '@mui/icons-material';

const HavingFilters = ({
                           aggregates,
                           onAddHavingFilter,
                           onRemoveHavingFilter,
                           havingFilters,
                           fieldsConfig = {
                               operators: [],
                               fields: [],
                               numericAggregations: [],
                               nonNumericAggregations: [],
                               dateAggregations: []
                           },
                           resetTrigger
                       }) => {
    const [column, setColumn] = useState("");
    const [operator, setOperator] = useState(">");
    const [value, setValue] = useState("");
    const [expanded, setExpanded] = useState(false);

    const {
        operators = [],
        fields = [],
        numericAggregations = [],
        nonNumericAggregations = [],
        dateAggregations = []
    } = fieldsConfig;

    const handleAddHavingFilter = () => {
        if (column && operator && value) {
            const fullAggregate = aggregates.find((agg) => agg.startsWith(column));
            if (fullAggregate) {
                const havingFilter = `${fullAggregate}${operator}${value}`;
                onAddHavingFilter(havingFilter);
                setColumn("");
                setValue("");
            }
        }
    };

    const handleClearAll = () => {
        havingFilters.forEach((_, index) => onRemoveHavingFilter(index));
    };

    const filteredOperators = operators.filter(op => op.value !== "==");

    // Функция для получения перевода названия поля
    const getFieldLabel = (fieldValue) => {
        const fieldObj = fields.find(f => f.value === fieldValue);
        return fieldObj ? fieldObj.label : fieldValue;
    };

    // Функция для получения перевода агрегации
    const getAggregationLabel = (aggValue) => {
        const allAggregations = [...numericAggregations, ...nonNumericAggregations, ...dateAggregations];
        const aggObj = allAggregations.find(a => a.value === aggValue);
        return aggObj ? aggObj.label : aggValue;
    };

    // Форматирование отображения агрегированного поля (например, "title:avg" -> "Название вакансии (Среднее)")
    const formatAggregate = (agg) => {
        const [field, aggregation] = agg.split(":");
        const fieldLabel = getFieldLabel(field);
        const aggLabel = getAggregationLabel(aggregation);
        return `${fieldLabel} (${aggLabel})`;
    };

    // Форматирование отображения фильтра (например, "title:avg>1000" -> "Название вакансии (Среднее) > 1000")
    const formatFilterDisplay = (filter) => {
        const parts = filter.split(/([<>!=]+)/);
        const [field, aggregation] = parts[0].split(":");
        const operator = parts[1];
        const value = parts[2];

        const fieldLabel = getFieldLabel(field);
        const aggLabel = getAggregationLabel(aggregation);

        return `${fieldLabel} (${aggLabel}) ${operator} ${value}`;
    };

    return (
        <Paper elevation={2} sx={{ mb: 2 }}>
            <Accordion expanded={expanded} onChange={() => setExpanded(!expanded)}>
                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                    <Typography variant="subtitle1">Фильтры по агрегированным полям (HAVING)</Typography>
                    {havingFilters.length > 0 && (
                        <Chip
                            label={havingFilters.length}
                            size="small"
                            color="primary"
                            sx={{ ml: 1 }}
                        />
                    )}
                </AccordionSummary>

                <AccordionDetails>
                    {havingFilters.length > 0 && (
                        <Box sx={{ mb: 2 }}>
                            <Typography variant="body2" color="text.secondary" gutterBottom>
                                Активные фильтры:
                            </Typography>
                            <Stack direction="row" spacing={1} flexWrap="wrap">
                                {havingFilters.map((filter, index) => (
                                    <Chip
                                        key={index}
                                        label={formatFilterDisplay(filter)}
                                        onDelete={() => onRemoveHavingFilter(index)}
                                        deleteIcon={<CloseIcon />}
                                        variant="outlined"
                                        size="small"
                                        sx={{
                                            maxWidth: 300,
                                            overflow: 'hidden',
                                            textOverflow: 'ellipsis'
                                        }}
                                    />
                                ))}
                            </Stack>
                            <Divider sx={{ my: 2 }} />
                        </Box>
                    )}

                    <Grid container spacing={2} alignItems="flex-end">
                        <Grid item xs={12} sm={5}>
                            <FormControl fullWidth size="medium" sx={{ minWidth: 200 }}>
                                <InputLabel>Столбец</InputLabel>
                                <Select
                                    value={column}
                                    onChange={(e) => setColumn(e.target.value)}
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
                                    {aggregates.map((agg) => {
                                        const [field] = agg.split(":");
                                        return (
                                            <MenuItem
                                                key={agg}
                                                value={field}
                                                sx={{
                                                    whiteSpace: 'normal',
                                                    wordBreak: 'break-word'
                                                }}
                                            >
                                                {formatAggregate(agg)}
                                            </MenuItem>
                                        );
                                    })}
                                </Select>
                            </FormControl>
                        </Grid>

                        <Grid item xs={12} sm={2}>
                            <FormControl fullWidth size="medium">
                                <InputLabel>Оператор</InputLabel>
                                <Select
                                    value={operator}
                                    onChange={(e) => setOperator(e.target.value)}
                                    label="Оператор"
                                >
                                    {filteredOperators.map((op) => (
                                        <MenuItem key={op.value} value={op.value}>
                                            {op.label}
                                        </MenuItem>
                                    ))}
                                </Select>
                            </FormControl>
                        </Grid>

                        <Grid item xs={12} sm={3}>
                            <TextField
                                fullWidth
                                size="medium"
                                label="Значение"
                                value={value}
                                onChange={(e) => setValue(e.target.value)}
                                InputProps={{
                                    style: { height: '44px' }
                                }}
                            />
                        </Grid>

                        <Grid item xs={12} sm={2}>
                            <Button
                                fullWidth
                                variant="contained"
                                startIcon={<AddIcon />}
                                onClick={handleAddHavingFilter}
                                disabled={!column || !operator || !value}
                                sx={{
                                    height: '44px',
                                    whiteSpace: 'nowrap'
                                }}
                            >
                                Добавить
                            </Button>
                        </Grid>
                    </Grid>

                    {havingFilters.length > 0 && (
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

export default HavingFilters;