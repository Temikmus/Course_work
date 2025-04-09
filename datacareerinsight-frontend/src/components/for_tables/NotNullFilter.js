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
    FilterList as FilterListIcon,
    KeyboardArrowDown as KeyboardArrowDownIcon
} from '@mui/icons-material';

const NotNullFilter = ({
                           notNull,
                           onApplyNotNullFilter,
                           resetTrigger,
                           fieldsConfig = { fields: [] },
                       }) => {
    const [anchorEl, setAnchorEl] = useState(null);
    const [selectedColumns, setSelectedColumns] = useState([]);
    const [expanded, setExpanded] = useState(false);
    const { fields = [] } = fieldsConfig;

    useEffect(() => {
        if (notNull) {
            setSelectedColumns(notNull.split(","));
        } else {
            setSelectedColumns([]);
        }
    }, [notNull, resetTrigger]);

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
        onApplyNotNullFilter(newSelected.join(","));
    };

    const handleClear = () => {
        setSelectedColumns([]);
        onApplyNotNullFilter("");
    };

    // Функция для получения названия поля по его значению
    const getFieldLabel = (fieldValue) => {
        const fieldObj = fields.find(f => f.value === fieldValue);
        return fieldObj ? fieldObj.label : fieldValue;
    };

    return (
        <Paper elevation={2} sx={{ mb: 2 }}>
            <Accordion expanded={expanded} onChange={() => setExpanded(!expanded)}>
                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                    <Typography variant="subtitle1">Фильтр по непустым значениям</Typography>
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
                            <Typography variant="body2" color="text.secondary" gutterBottom>
                                В выбранных столбцах не будет пропусков (null)
                            </Typography>
                            <Button
                                fullWidth
                                variant="outlined"
                                startIcon={<FilterListIcon />}
                                endIcon={<KeyboardArrowDownIcon />}
                                onClick={handleMenuOpen}
                                sx={{ height: '40px' }}
                            >
                                {selectedColumns.length > 0
                                    ? 'Изменить выбор столбцов'
                                    : 'Выбрать столбцы'}
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
                                        onDelete={() => handleColumnToggle(column)}
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
                                Очистить фильтр
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
                            <Typography variant="subtitle2" gutterBottom>
                                Выберите столбцы:
                            </Typography>
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
                                        <ListItemText
                                            primary={field.label}
                                        />
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

export default NotNullFilter;