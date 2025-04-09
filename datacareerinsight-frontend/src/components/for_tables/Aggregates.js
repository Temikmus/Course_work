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
    Typography,
    IconButton
} from '@mui/material';
import {
    Add as AddIcon,
    Close as CloseIcon,
    ExpandMore as ExpandMoreIcon
} from '@mui/icons-material';

const Aggregates = ({
                        aggregates,
                        onApplyAggregates,
                        fieldsConfig = {
                            fields: [],
                            numericFields: [],
                            numericAggregations: [],
                            nonNumericAggregations: [],
                            dateFields: [],
                            dateAggregations: []
                        },
                        resetTrigger
                    }) => {
    const [selectedColumn, setSelectedColumn] = useState("");
    const [selectedAggregation, setSelectedAggregation] = useState("");
    const [aggregatesList, setAggregatesList] = useState([]);
    const [expanded, setExpanded] = useState(false);

    const {
        fields = [],
        numericFields = [],
        numericAggregations = [],
        nonNumericAggregations = [],
        dateFields = [],
        dateAggregations = []
    } = fieldsConfig;

    useEffect(() => {
        setAggregatesList(aggregates ? aggregates.split(",") : []);
    }, [aggregates, resetTrigger]);

    const handleAddAggregate = () => {
        if (selectedColumn && selectedAggregation) {
            const newAggregate = `${selectedColumn}:${selectedAggregation}`;
            const updatedAggregatesList = [...aggregatesList, newAggregate];
            setAggregatesList(updatedAggregatesList);
            onApplyAggregates(updatedAggregatesList.join(","));
            setSelectedColumn("");
            setSelectedAggregation("");
        }
    };

    const handleRemoveAggregate = (index) => {
        const updatedAggregatesList = aggregatesList.filter((_, i) => i !== index);
        setAggregatesList(updatedAggregatesList);
        onApplyAggregates(updatedAggregatesList.join(","));
    };

    const handleClearAll = () => {
        setAggregatesList([]);
        onApplyAggregates("");
    };

    const getAvailableAggregations = () => {
        if (numericFields.includes(selectedColumn)) {
            return numericAggregations;
        } else if (dateFields.includes(selectedColumn)) {
            return dateAggregations;
        }
        return nonNumericAggregations;
    };

    const getFieldLabel = (fieldValue) => {
        const fieldObj = fields.find(f => f.value === fieldValue);
        return fieldObj ? fieldObj.label : fieldValue;
    };

    const formatAggregateDisplay = (aggregate) => {
        const [field, agg] = aggregate.split(":");
        const fieldLabel = getFieldLabel(field);
        const aggObj = [...numericAggregations, ...nonNumericAggregations, ...dateAggregations]
            .find(a => a.value === agg);
        const aggLabel = aggObj ? aggObj.label : agg;

        return `${fieldLabel} (${aggLabel})`;
    };

    return (
        <Paper elevation={2} sx={{ mb: 2 }}>
            <Accordion expanded={expanded} onChange={() => setExpanded(!expanded)}>
                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                    <Typography variant="subtitle1">Агрегации</Typography>
                    {aggregatesList.length > 0 && (
                        <Chip
                            label={aggregatesList.length}
                            size="small"
                            color="primary"
                            sx={{ ml: 1 }}
                        />
                    )}
                </AccordionSummary>

                <AccordionDetails>
                    {aggregatesList.length > 0 && (
                        <Box sx={{ mb: 2 }}>
                            <Typography variant="body2" color="text.secondary" gutterBottom>
                                Активные агрегации:
                            </Typography>
                            <Stack direction="row" spacing={1} flexWrap="wrap">
                                {aggregatesList.map((aggregate, index) => (
                                    <Chip
                                        key={index}
                                        label={formatAggregateDisplay(aggregate)}
                                        onDelete={() => handleRemoveAggregate(index)}
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
                                    value={selectedColumn}
                                    onChange={(e) => {
                                        setSelectedColumn(e.target.value);
                                        setSelectedAggregation("");
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
                                >
                                    <MenuItem value="">
                                        <em>Выберите столбец</em>
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

                        <Grid item xs={12} sm={5}>
                            <FormControl fullWidth size="medium" disabled={!selectedColumn} sx={{ minWidth: 200 }}>
                                <InputLabel>Агрегация</InputLabel>
                                <Select
                                    value={selectedAggregation}
                                    onChange={(e) => setSelectedAggregation(e.target.value)}
                                    label="Агрегация"
                                >
                                    <MenuItem value="">
                                        <em>Выберите агрегацию</em>
                                    </MenuItem>
                                    {getAvailableAggregations().map((agg) => (
                                        <MenuItem key={agg.value} value={agg.value}>
                                            {agg.label}
                                        </MenuItem>
                                    ))}
                                </Select>
                            </FormControl>
                        </Grid>

                        <Grid item xs={12} sm={2}>
                            <Button
                                fullWidth
                                variant="contained"
                                startIcon={<AddIcon />}
                                onClick={handleAddAggregate}
                                disabled={!selectedColumn || !selectedAggregation}
                                sx={{
                                    height: '44px',
                                    whiteSpace: 'nowrap'
                                }}
                            >
                                Добавить
                            </Button>
                        </Grid>
                    </Grid>

                    {aggregatesList.length > 0 && (
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

export default Aggregates;