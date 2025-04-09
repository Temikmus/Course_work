import React, { useState, useEffect } from "react";
import {
    Accordion,
    AccordionSummary,
    AccordionDetails,
    Box,
    Button,
    Checkbox,
    Chip,
    Grid,
    List,
    ListItem,
    ListItemText,
    Menu,
    Paper,
    Stack,
    Typography
} from '@mui/material';
import {
    Close as CloseIcon,
    ExpandMore as ExpandMoreIcon,
    GroupWork as GroupWorkIcon,
    KeyboardArrowDown as KeyboardArrowDownIcon
} from '@mui/icons-material';

const GroupBy = ({
                     groupBy,
                     onApplyGroupBy,
                     onClearGroupBy,
                     resetTrigger,
                     fieldsConfig = { fields: [] }
                 }) => {
    const [anchorEl, setAnchorEl] = useState(null);
    const [selectedColumns, setSelectedColumns] = useState([]);
    const [expanded, setExpanded] = useState(false);
    const { fields = [] } = fieldsConfig;

    useEffect(() => {
        if (groupBy) {
            setSelectedColumns(groupBy.split(","));
        } else {
            setSelectedColumns([]);
        }
    }, [groupBy]);

    useEffect(() => {
        setAnchorEl(null);
    }, [resetTrigger]);

    const handleMenuOpen = (event) => {
        setAnchorEl(event.currentTarget);
    };

    const handleMenuClose = () => {
        setAnchorEl(null);
    };

    const handleColumnToggle = (column) => {
        const newSelected = selectedColumns.includes(column)
            ? selectedColumns.filter(col => col !== column)
            : [...selectedColumns, column];

        setSelectedColumns(newSelected);
        if (newSelected.length > 0) {
            onApplyGroupBy(newSelected.join(","));
        } else {
            onClearGroupBy();
        }
    };

    const handleColumnRemove = (column) => {
        const newSelected = selectedColumns.filter(col => col !== column);
        setSelectedColumns(newSelected);

        if (newSelected.length > 0) {
            onApplyGroupBy(newSelected.join(","));
        } else {
            onClearGroupBy();
        }
    };

    const handleClear = () => {
        setSelectedColumns([]);
        onClearGroupBy();
    };

    const getFieldLabel = (fieldValue) => {
        const fieldObj = fields.find(f => f.value === fieldValue);
        return fieldObj ? fieldObj.label : fieldValue;
    };

    return (
        <Paper elevation={2} sx={{ mb: 2 }}>
            <Accordion expanded={expanded} onChange={() => setExpanded(!expanded)}>
                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                    <Typography variant="subtitle1">Группировка</Typography>
                    {selectedColumns.length > 0 && (
                        <Chip
                            label={selectedColumns.length}
                            size="small"
                            color="primary"
                            sx={{ ml: 1 }}
                        />
                    )}
                </AccordionSummary>

                <AccordionDetails>
                    <Grid container spacing={2} alignItems="center">
                        <Grid item xs={12}>
                            <Button
                                fullWidth
                                variant="outlined"
                                startIcon={<GroupWorkIcon />}
                                endIcon={<KeyboardArrowDownIcon />}
                                onClick={handleMenuOpen}
                                sx={{ height: '40px' }}
                            >
                                {selectedColumns.length > 0
                                    ? 'Изменить столбцы группировки'
                                    : 'Выбрать столбцы для группировки'}
                            </Button>
                        </Grid>
                    </Grid>

                    {selectedColumns.length > 0 && (
                        <Box sx={{ mt: 2 }}>
                            <Typography variant="body2" color="text.secondary" gutterBottom>
                                Выбранные столбцы:
                            </Typography>
                            <Stack direction="row" spacing={1} flexWrap="wrap">
                                {selectedColumns.map(column => (
                                    <Chip
                                        key={column}
                                        label={getFieldLabel(column)}
                                        onDelete={() => handleColumnRemove(column)}
                                        deleteIcon={<CloseIcon />}
                                        variant="outlined"
                                        color="primary"
                                        sx={{ mb: 1 }}
                                    />
                                ))}
                            </Stack>
                        </Box>
                    )}

                    {selectedColumns.length > 0 && (
                        <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
                            <Button
                                variant="outlined"
                                color="error"
                                onClick={handleClear}
                            >
                                Очистить группировку
                            </Button>
                        </Box>
                    )}

                    <Menu
                        anchorEl={anchorEl}
                        open={Boolean(anchorEl)}
                        onClose={handleMenuClose}
                        PaperProps={{
                            style: {
                                maxHeight: 400,
                                width: 300,
                            },
                        }}
                    >
                        <Box sx={{ p: 2 }}>
                            <Typography variant="subtitle2">Доступные столбцы:</Typography>
                            <List dense>
                                {fields.map(field => (
                                    <ListItem
                                        key={field.value}
                                        disablePadding
                                        secondaryAction={
                                            <Checkbox
                                                edge="end"
                                                checked={selectedColumns.includes(field.value)}
                                                onChange={() => handleColumnToggle(field.value)}
                                            />
                                        }
                                    >
                                        <ListItemText primary={field.label} />
                                    </ListItem>
                                ))}
                            </List>
                        </Box>
                    </Menu>
                </AccordionDetails>
            </Accordion>
        </Paper>
    );
};

export default GroupBy;