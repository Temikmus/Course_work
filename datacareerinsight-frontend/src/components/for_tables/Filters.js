import React, { useState } from "react";
import {
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
    TextField,
    Typography,
    Stack,
    Accordion,
    AccordionSummary,
    AccordionDetails,
    IconButton
} from '@mui/material';
import {
    Add as AddIcon,
    Close as CloseIcon,
    ExpandMore as ExpandMoreIcon
} from '@mui/icons-material';

const Filters = ({
                     filters,
                     onAddFilter,
                     onRemoveFilter,
                     fieldsConfig = {
                         fields: [],
                         numericFields: [],
                         dateFields: [],
                         operators: [],
                         numericAggregations: [],
                         nonNumericAggregations: [],
                         dateAggregations: [],
                         getFilteredOperators: () => []
                     }
                 }) => {
    const [field, setField] = useState("");
    const [operator, setOperator] = useState("=");
    const [logic, setLogic] = useState("or");
    const [value, setValue] = useState("");
    const [dateValue, setDateValue] = useState(null);
    const [isHelperSelected, setIsHelperSelected] = useState(false);
    const [expanded, setExpanded] = useState(false);

    const {
        fields = [],
        operators = [],
        numericFields = [],
        dateFields = [],
        numericAggregations = [],
        nonNumericAggregations = [],
        dateAggregations = [],
        getFilteredOperators
    } = fieldsConfig;

    const handleHelperClick = (aggValue) => {
        if (field) {
            const formattedValue = `${aggValue}~${field}`;
            setValue(formattedValue);
            setIsHelperSelected(true);
        }
    };

    const handleDateChange = (date) => {
        setDateValue(date);
        if (date) {
            const formattedDate = date.toISOString().split("T")[0];
            setValue(formattedDate);
        } else {
            setValue("");
        }
    };

    const handleAddFilter = () => {
        if (field && operator && logic && value) {
            const formattedValue = value.split(",").join("~");
            onAddFilter({ field, operator, logic, value: formattedValue });
            setField("");
            setValue("");
            setDateValue(null);
            setIsHelperSelected(false);
        }
    };

    const filteredOperators = getFilteredOperators(field);

    const getAvailableAggregations = () => {
        if (numericFields.includes(field)) {
            return numericAggregations.filter(agg =>
                ["avg", "max", "min", "median", "mode"].includes(agg.value)
            );
        } else if (dateFields.includes(field)) {
            return dateAggregations.filter(agg => agg.value !== "count");
        } else {
            return nonNumericAggregations.filter(agg => agg.value !== "count");
        }
    };

    const getFieldLabel = (fieldValue) => {
        const fieldObj = fields.find(f => f.value === fieldValue);
        return fieldObj ? fieldObj.label : fieldValue;
    };

    return (
        <Paper elevation={2} sx={{
            mb: 2,
            width: '100%',
            maxWidth: 1200,
        }}>
            <Accordion expanded={expanded} onChange={() => setExpanded(!expanded)}>
                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                    <Typography variant="subtitle1">Фильтры</Typography>
                    {filters.length > 0 && (
                        <Chip
                            label={filters.length}
                            size="small"
                            color="primary"
                            sx={{ ml: 1 }}
                        />
                    )}
                </AccordionSummary>

                <AccordionDetails>
                    {/* Активные фильтры */}
                    {filters.length > 0 && (
                        <Box sx={{ mb: 2 }}>
                            <Typography variant="body2" color="text.secondary" gutterBottom>
                                Активные фильтры:
                            </Typography>
                            <Stack direction="row" spacing={1} flexWrap="wrap">
                                {filters.map((filter, index) => (
                                    <Chip
                                        key={index}
                                        label={`${getFieldLabel(filter.field)} ${filter.operator} ${filter.logic}: ${filter.value.replace(/~/g, ", ")}`}
                                        onDelete={() => onRemoveFilter(index)}
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

                    {/* Форма добавления фильтра */}
                    <Grid container spacing={2} alignItems="flex-end">
                        {/* Поле */}
                        <Grid item xs={12} sm={4}>
                            <FormControl fullWidth size="medium" sx={{ minWidth: 200 }}>
                                <InputLabel>Столбец</InputLabel>
                                <Select
                                    value={field}
                                    onChange={(e) => {
                                        setField(e.target.value);
                                        setIsHelperSelected(false);
                                    }}
                                    label="Столбец"
                                    MenuProps={{
                                        PaperProps: {
                                            style: {
                                                maxHeight: 400,
                                                width: 350,
                                            },
                                        },
                                    }}
                                    sx={{
                                        '& .MuiSelect-select': {
                                            minHeight: '1.5em',
                                        },
                                    }}
                                >
                                    <MenuItem value="">
                                    </MenuItem>
                                    {fields.map((field) => (
                                        <MenuItem
                                            key={field.value}
                                            value={field.value}
                                            sx={{
                                                whiteSpace: 'normal',
                                                wordBreak: 'break-word'
                                            }}
                                        >
                                            {field.label}
                                        </MenuItem>
                                    ))}
                                </Select>
                            </FormControl>
                        </Grid>

                        {/* Оператор */}
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

                        {/* Логика (скрываем для дат) */}
                        {!dateFields.includes(field) && (
                            <Grid item xs={12} sm={2}>
                                <FormControl fullWidth size="medium">
                                    <InputLabel>Логика</InputLabel>
                                    <Select
                                        value={logic}
                                        onChange={(e) => setLogic(e.target.value)}
                                        label="Логика"
                                    >
                                        <MenuItem value="or">Или</MenuItem>
                                        <MenuItem value="and">И</MenuItem>
                                    </Select>
                                </FormControl>
                            </Grid>
                        )}

                        {/* Ввод значения */}
                        <Grid item xs={12} sm={3}>
                            {dateFields.includes(field) && !isHelperSelected ? (
                                <TextField
                                    fullWidth
                                    size="medium"
                                    label="Дата"
                                    type="date"
                                    value={dateValue ? dateValue.toISOString().split('T')[0] : ''}
                                    onChange={(e) => {
                                        const date = e.target.value ? new Date(e.target.value) : null;
                                        handleDateChange(date);
                                    }}
                                    InputLabelProps={{
                                        shrink: true,
                                    }}
                                    InputProps={{
                                        style: { height: '44px' }
                                    }}
                                />
                            ) : (
                                <TextField
                                    fullWidth
                                    size="medium"
                                    label="Значение"
                                    value={value}
                                    onChange={(e) => setValue(e.target.value)}
                                    placeholder="Через запятую"
                                    InputProps={{
                                        style: { height: '44px' }
                                    }}
                                />
                            )}
                        </Grid>

                        {/* Кнопка добавления */}
                        <Grid item xs={12} sm={1}>
                            <Button
                                fullWidth
                                variant="contained"
                                startIcon={<AddIcon />}
                                onClick={handleAddFilter}
                                disabled={!field || !operator || !value}
                                sx={{
                                    height: '44px',
                                    whiteSpace: 'nowrap'
                                }}
                            >
                                Добавить
                            </Button>
                        </Grid>

                        {/* Вспомогательные кнопки */}
                        {field && (
                            <Grid item xs={12}>
                                <Stack direction="row" spacing={1} flexWrap="wrap">
                                    {getAvailableAggregations().map((agg) => (
                                        <Button
                                            key={agg.value}
                                            variant="outlined"
                                            size="small"
                                            onClick={() => handleHelperClick(agg.value)}
                                            sx={{
                                                minWidth: 'auto'
                                            }}
                                        >
                                            {agg.label}
                                        </Button>
                                    ))}
                                </Stack>
                            </Grid>
                        )}
                    </Grid>
                </AccordionDetails>
            </Accordion>
        </Paper>
    );
};

export default Filters;