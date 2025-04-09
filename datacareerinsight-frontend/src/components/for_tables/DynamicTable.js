import React, { useState } from "react";
import {
    Box,
    Button,
    Checkbox,
    Chip,
    Divider,
    FormControlLabel,
    IconButton,
    Menu,
    MenuItem,
    Paper,
    Stack,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Tooltip,
    Typography
} from '@mui/material';
import {
    ViewColumn as ViewColumnIcon,
    Visibility as VisibilityIcon,
    VisibilityOff as VisibilityOffIcon
} from '@mui/icons-material';

const DynamicTable = ({
                          data,
                          visibleColumns,
                          onToggleColumn,
                          fieldsConfig = { fields: [] }
                      }) => {
    const [anchorEl, setAnchorEl] = useState(null);
    const open = Boolean(anchorEl);

    if (data.length === 0) {
        return (
            <Box sx={{ p: 4, textAlign: 'center' }}>
                <Typography variant="body1">Нет данных для отображения</Typography>
            </Box>
        );
    }

    // Получаем все возможные столбцы из первого элемента данных
    const columns = Object.keys(data[0]);

    // Функция для получения перевода названия столбца
    const getColumnLabel = (column) => {
        // Проверяем, является ли столбец агрегированным (содержит _)
        if (column.includes('_')) {
            const lastUnderscoreIndex = column.lastIndexOf('_');
            const fieldName = column.slice(0, lastUnderscoreIndex);
            const aggregation = column.slice(lastUnderscoreIndex + 1);

            // Находим поле в конфигурации
            const field = fieldsConfig.fields.find(f => f.value === fieldName);
            const fieldLabel = field ? field.label : fieldName;

            // Находим агрегацию в конфигурации
            const allAggregations = [
                ...(fieldsConfig.numericAggregations || []),
                ...(fieldsConfig.nonNumericAggregations || []),
                ...(fieldsConfig.dateAggregations || [])
            ];
            const agg = allAggregations.find(a => a.value === aggregation);
            const aggLabel = agg ? agg.label : aggregation;

            return `${fieldLabel} (${aggLabel})`;
        }

        // Для обычных столбцов
        const field = fieldsConfig.fields.find(f => f.value === column);
        return field ? field.label : column;
    };

    const handleMenuClick = (event) => {
        setAnchorEl(event.currentTarget);
    };

    const handleMenuClose = () => {
        setAnchorEl(null);
    };

    return (
        <Box sx={{ width: '100%', mt: 2 }}>
            {/* Панель управления столбцами */}
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                <Tooltip title="Управление столбцами">
                    <Button
                        variant="outlined"
                        startIcon={<ViewColumnIcon />}
                        onClick={handleMenuClick}
                    >
                        Управление столбцами
                    </Button>
                </Tooltip>

                {/* Быстрый просмотр выбранных столбцов */}
                <Stack direction="row" spacing={1} flexWrap="wrap">
                    {columns.map(column => (
                        <Chip
                            key={column}
                            label={getColumnLabel(column)}
                            onClick={() => onToggleColumn(column)}
                            icon={visibleColumns[column] ?
                                <VisibilityIcon fontSize="small" /> :
                                <VisibilityOffIcon fontSize="small" />}
                            variant={visibleColumns[column] ? "filled" : "outlined"}
                            color={visibleColumns[column] ? "primary" : "default"}
                            size="small"
                        />
                    ))}
                </Stack>
            </Box>

            {/* Меню выбора столбцов */}
            <Menu
                anchorEl={anchorEl}
                open={open}
                onClose={handleMenuClose}
                PaperProps={{
                    style: {
                        maxHeight: 400,
                        width: 300,
                    },
                }}
            >
                <Box sx={{ p: 2 }}>
                    <Typography variant="subtitle1" gutterBottom>
                        Видимые столбцы:
                    </Typography>
                    <Divider sx={{ mb: 2 }} />
                    {columns.map((column) => (
                        <MenuItem key={column} dense>
                            <FormControlLabel
                                control={
                                    <Checkbox
                                        checked={visibleColumns[column]}
                                        onChange={() => onToggleColumn(column)}
                                    />
                                }
                                label={getColumnLabel(column)}
                                sx={{ width: '100%' }}
                            />
                        </MenuItem>
                    ))}
                </Box>
            </Menu>

            {/* Таблица */}
            <TableContainer component={Paper}>
                <Table size="small" stickyHeader>
                    <TableHead>
                        <TableRow>
                            {columns.map(
                                (column) =>
                                    visibleColumns[column] && (
                                        <TableCell key={column}>
                                            <Typography fontWeight="bold">
                                                {getColumnLabel(column)}
                                            </Typography>
                                        </TableCell>
                                    )
                            )}
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {data.map((row, rowIndex) => (
                            <TableRow key={rowIndex}>
                                {columns.map(
                                    (column) =>
                                        visibleColumns[column] && (
                                            <TableCell key={column}>
                                                {Array.isArray(row[column])
                                                    ? row[column].join(", ")
                                                    : typeof row[column] === 'object'
                                                        ? JSON.stringify(row[column])
                                                        : String(row[column])}
                                            </TableCell>
                                        )
                                )}
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>
        </Box>
    );
};

export default DynamicTable;