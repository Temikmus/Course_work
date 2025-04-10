import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
    Box,
    Button,
    Card,
    CardContent,
    CardHeader,
    CircularProgress,
    Container,
    FormControlLabel,
    Grid,
    IconButton,
    Paper,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Typography,
    Tooltip,
    Pagination,
    TextField,
    MenuItem,
    Checkbox,
    Accordion,
    AccordionSummary,
    AccordionDetails
} from '@mui/material';
import {
    Refresh as RefreshIcon,
    ExpandMore as ExpandMoreIcon,
    Clear as ClearIcon
} from '@mui/icons-material';
import Filters from '../for_tables/Filters';
import GroupBy from '../for_tables/GroupBy';
import Aggregates from '../for_tables/Aggregates';
import HavingFilters from '../for_tables/HavingFilters';
import SortBy from '../for_tables/SortBy';
import NotNullFilter from '../for_tables/NotNullFilter';
import { useRowResize } from '../charts/hooks/useRowResize';
import { useTheme } from '@mui/material/styles';

const DEFAULT_ROW_HEIGHT = 52;
const MAX_ROW_HEIGHT = 300;

const GenericTable = ({
                          title = "Данные",
                          apiEndpoint,
                          fieldsConfig = {
                              fields: [],
                              numericAggregations: [],
                              nonNumericAggregations: [],
                              dateAggregations: []
                          },
                          hiddenColumnsByDefault = [],
                          defaultLimit = 8,
                          colorTheme = 'primary'
                      }) => {
    const [data, setData] = useState([]);
    const [totalCount, setTotalCount] = useState(0);
    const [loading, setLoading] = useState(true);
    const [offset, setOffset] = useState(0);
    const [filters, setFilters] = useState([]);
    const [groupBy, setGroupBy] = useState("");
    const [aggregates, setAggregates] = useState("");
    const [havingFilters, setHavingFilters] = useState([]);
    const [sortBy, setSortBy] = useState("");
    const [resetTrigger, setResetTrigger] = useState(false);
    const [notNull, setNotNull] = useState("");
    const [limit, setLimit] = useState(defaultLimit);
    const [visibleColumns, setVisibleColumns] = useState({});
    const [page, setPage] = useState(1);
    const theme = useTheme();
    const { rowHeights, handleMouseDown, hoveredRow, setHoveredRow } = useRowResize(DEFAULT_ROW_HEIGHT);

    // Цветовые схемы
    const colorSchemes = {
        primary: {
            main: '#8bbaf0',       // Светлый голубовато-синий (нежный)
            contrastText: 'white' // Насыщенный синий (для контраста)
        },
        resume: {
            main: '#b39ddb', // Нежно-фиолетовый (второй цвет градиента)
            contrastText: 'white' // Мягкий фиолетовый (первый цвет градиента)
        }
    };

    const colors = colorSchemes[colorTheme] || colorSchemes.primary;

    const headerBgColor = colors.main;
    const headerTextColor = colors.contrastText;
    const evenRowBgColor = theme.palette.background.paper;
    const oddRowBgColor = theme.palette.grey[50];
    const hoverRowBgColor = theme.palette.action.hover;
    const borderColor = theme.palette.divider;

    useEffect(() => {
        if (data.length > 0) {
            const columns = Object.keys(data[0]);
            const initialVisibility = {};
            columns.forEach((column) => {
                initialVisibility[column] = !hiddenColumnsByDefault.includes(column);
            });

            if (groupBy) {
                const groupByColumns = groupBy.split(',');
                groupByColumns.forEach(column => {
                    if (column in initialVisibility) {
                        initialVisibility[column] = true;
                    }
                });
            }

            setVisibleColumns(initialVisibility);
        }
    }, [data, groupBy, resetTrigger, hiddenColumnsByDefault]);

    const fetchData = async () => {
        try {
            setLoading(true);
            const filtersString = filters
                .map((filter) => `${filter.field}${filter.operator}${filter.logic}:${filter.value}`)
                .join(";");

            const params = {
                offset: Number(offset),
                limit: Number(limit),
            };

            if (filtersString) params.filters = filtersString;
            if (groupBy) params.group_by = groupBy;
            if (aggregates) params.aggregates = aggregates;
            if (havingFilters?.length > 0) params.having = havingFilters.join("~");
            if (sortBy) params.sort_by = sortBy;
            if (notNull) params.not_null = notNull;

            const response = await axios.get(apiEndpoint, { params });
            setData(response.data.results);
            setTotalCount(response.data.total_count);
        } catch (error) {
            console.error(`Ошибка загрузки ${title.toLowerCase()}:`, error);
        } finally {
            setLoading(false);
        }
    };

    const handleAddFilter = (newFilter) => {
        setFilters([...filters, newFilter]);
    };

    const handleRemoveFilter = (index) => {
        setFilters(filters.filter((_, i) => i !== index));
    };

    const handlePageChange = (event, value) => {
        const newOffset = (value - 1) * limit;
        setOffset(newOffset);
        setPage(value);
    };

    const handleApplyGroupBy = (groupByValue) => {
        setGroupBy(groupByValue);
    };

    const handleClearGroupBy = () => {
        setGroupBy("");
    };

    const handleApplyAggregates = (aggregatesValue) => {
        setAggregates(aggregatesValue);
    };

    const handleAddHavingFilter = (havingFilter) => {
        setHavingFilters([...havingFilters, havingFilter]);
    };

    const handleRemoveHavingFilter = (index) => {
        setHavingFilters(havingFilters.filter((_, i) => i !== index));
    };

    const handleApplySortBy = (sortByValue) => {
        setSortBy(sortByValue);
    };

    const handleApplyNotNullFilter = (notNullValue) => {
        setNotNull(notNullValue);
    };

    const handleApplyLimit = (newLimit) => {
        setLimit(newLimit);
        setOffset(0);
        setPage(1);
    };

    const handleReset = () => {
        setFilters([]);
        setGroupBy("");
        setAggregates("");
        setHavingFilters([]);
        setSortBy("");
        setNotNull("");
        setLimit(defaultLimit);
        setOffset(0);
        setPage(1);
        setResetTrigger((prev) => !prev);
    };

    const toggleColumnVisibility = (column) => {
        setVisibleColumns((prev) => ({
            ...prev,
            [column]: !prev[column],
        }));
    };

    const handleClearColumns = () => {
        const columns = Object.keys(data[0]);
        const resetVisibility = {};
        columns.forEach((column) => {
            resetVisibility[column] = !hiddenColumnsByDefault.includes(column);
        });
        setVisibleColumns(resetVisibility);
    };

    const getColumnLabel = (column) => {
        if (column.includes('_')) {
            const lastUnderscoreIndex = column.lastIndexOf('_');
            const fieldName = column.slice(0, lastUnderscoreIndex);
            const aggregation = column.slice(lastUnderscoreIndex + 1);

            const allAggregations = [
                ...(fieldsConfig.numericAggregations || []),
                ...(fieldsConfig.nonNumericAggregations || []),
                ...(fieldsConfig.dateAggregations || [])
            ];

            const isAggregated = allAggregations.some(a => a.value === aggregation);

            if (isAggregated) {
                const field = fieldsConfig.fields.find(f => f.value === fieldName);
                const fieldLabel = field ? field.label : fieldName;

                const agg = allAggregations.find(a => a.value === aggregation);
                const aggLabel = agg ? agg.label : aggregation;

                return `${fieldLabel} (${aggLabel})`;
            }
        }

        const field = fieldsConfig.fields.find(f => f.value === column);
        return field ? field.label : column;
    };

    useEffect(() => {
        fetchData();
    }, [offset, filters, groupBy, aggregates, havingFilters, sortBy, notNull, limit, resetTrigger]);

    useEffect(() => {
        setSortBy("");
    }, [filters, groupBy, aggregates, havingFilters, notNull]);

    useEffect(() => {
        setHavingFilters([]);
    }, [aggregates]);

    useEffect(() => {
        setOffset(0);
    }, [filters, groupBy, aggregates, havingFilters, sortBy, notNull]);

    if (loading && data.length === 0) {
        return (
            <Box display="flex" justifyContent="center" mt={4}>
                <CircularProgress />
            </Box>
        );
    }

    return (
        <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
            <Card sx={{
                border: `2px solid ${headerBgColor}`,
                borderRadius: '8px',
            }}>
                <CardHeader
                    title={title}
                    action={
                        <Tooltip title="Очистить всё">
                            <IconButton onClick={handleReset} sx={{ color: headerTextColor }}>
                                <RefreshIcon />
                            </IconButton>
                        </Tooltip>
                    }
                    sx={{
                        backgroundColor: headerBgColor,
                        color: headerTextColor,
                        '& .MuiCardHeader-title': {
                            fontWeight: 600
                        }
                    }}
                />

                <CardContent>
                    <Accordion defaultExpanded={false} sx={{ mb: 2 }}>
                        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                            <Typography variant="subtitle1" sx={{ fontWeight: 500 }}>Фильтры и настройки</Typography>
                        </AccordionSummary>
                        <AccordionDetails>
                            <Grid container spacing={2}>
                                <Grid item xs={12} md={6}>
                                    <Filters
                                        filters={filters}
                                        onAddFilter={handleAddFilter}
                                        onRemoveFilter={handleRemoveFilter}
                                        fieldsConfig={fieldsConfig}
                                    />
                                </Grid>

                                <Grid item xs={12} md={6}>
                                    <GroupBy
                                        groupBy={groupBy}
                                        onApplyGroupBy={handleApplyGroupBy}
                                        onClearGroupBy={handleClearGroupBy}
                                        resetTrigger={resetTrigger}
                                        fieldsConfig={fieldsConfig}
                                    />
                                </Grid>

                                <Grid item xs={12} md={6}>
                                    <Aggregates
                                        aggregates={aggregates}
                                        onApplyAggregates={handleApplyAggregates}
                                        fieldsConfig={fieldsConfig}
                                    />
                                </Grid>

                                {groupBy && aggregates && (
                                    <Grid item xs={12} md={6}>
                                        <HavingFilters
                                            aggregates={aggregates.split(",")}
                                            onAddHavingFilter={handleAddHavingFilter}
                                            onRemoveHavingFilter={handleRemoveHavingFilter}
                                            havingFilters={havingFilters}
                                            fieldsConfig={fieldsConfig}
                                        />
                                    </Grid>
                                )}

                                <Grid item xs={12} md={6}>
                                    <NotNullFilter
                                        notNull={notNull}
                                        onApplyNotNullFilter={handleApplyNotNullFilter}
                                        resetTrigger={resetTrigger}
                                        fieldsConfig={fieldsConfig}
                                    />
                                </Grid>

                                <Grid item xs={12} md={6}>
                                    <SortBy
                                        columns={Object.keys(data[0] || [])}
                                        onApplySortBy={handleApplySortBy}
                                        sortBy={sortBy}
                                        fieldsConfig={fieldsConfig}
                                    />
                                </Grid>

                                <Grid item xs={12}>
                                    <Box display="flex" justifyContent="flex-end" mt={2}>
                                        <Button
                                            variant="outlined"
                                            startIcon={<ClearIcon />}
                                            onClick={handleReset}
                                            color="error"
                                            size="medium"
                                        >
                                            Очистить всё
                                        </Button>
                                    </Box>
                                </Grid>
                            </Grid>
                        </AccordionDetails>
                    </Accordion>

                    {data.length > 0 && (
                        <Accordion sx={{ mb: 2 }}>
                            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                                <Typography variant="subtitle1" sx={{ fontWeight: 500 }}>Настроить видимость столбцов</Typography>
                            </AccordionSummary>
                            <AccordionDetails>
                                <Grid container spacing={2}>
                                    {Object.keys(visibleColumns).map((column) => (
                                        <Grid item xs={12} sm={6} md={4} key={column}>
                                            <FormControlLabel
                                                control={
                                                    <Checkbox
                                                        checked={visibleColumns[column]}
                                                        onChange={() => toggleColumnVisibility(column)}
                                                        color="primary"
                                                    />
                                                }
                                                label={getColumnLabel(column)}
                                            />
                                        </Grid>
                                    ))}
                                </Grid>
                            </AccordionDetails>
                        </Accordion>
                    )}

                    {data.length > 0 ? (
                        <TableContainer
                            component={Paper}
                            sx={{
                                mt: 2,
                                width: '100%',
                                overflowX: 'auto',
                                border: `1px solid ${borderColor}`,
                                borderRadius: '4px'
                            }}
                        >
                            <Table
                                size="small"
                                stickyHeader
                                sx={{
                                    tableLayout: 'fixed',
                                    minWidth: '100%'
                                }}
                            >
                                <TableHead>
                                    <TableRow>
                                        {Object.keys(data[0]).map(
                                            (column) =>
                                                visibleColumns[column] && (
                                                    <TableCell
                                                        key={column}
                                                        sx={{
                                                            backgroundColor: headerBgColor,
                                                            color: headerTextColor,
                                                            fontWeight: 'bold',
                                                            width: '200px'
                                                        }}
                                                    >
                                                        {getColumnLabel(column)}
                                                    </TableCell>
                                                )
                                        )}
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {data.map((row, rowIndex) => {
                                        const currentHeight = rowHeights[rowIndex] || DEFAULT_ROW_HEIGHT;
                                        return (
                                            <TableRow
                                                key={rowIndex}
                                                style={{
                                                    height: currentHeight,
                                                    position: 'relative',
                                                    backgroundColor: rowIndex % 2 === 0
                                                        ? evenRowBgColor
                                                        : oddRowBgColor
                                                }}
                                                sx={{
                                                    '&:hover': {
                                                        backgroundColor: hoverRowBgColor
                                                    },
                                                    '&:hover .resize-handle': {
                                                        opacity: 1,
                                                        backgroundColor: headerBgColor
                                                    }
                                                }}
                                            >
                                                {Object.entries(row).map(
                                                    ([column, value]) =>
                                                        visibleColumns[column] && (
                                                            <TableCell
                                                                key={column}
                                                                sx={{
                                                                    width: '200px',
                                                                    maxHeight: currentHeight,
                                                                    overflow: 'hidden',
                                                                    position: 'relative',
                                                                    padding: '8px 16px',
                                                                    borderBottom: `1px solid ${borderColor}`
                                                                }}
                                                            >
                                                                <div style={{
                                                                    maxHeight: currentHeight - 16,
                                                                    overflow: 'hidden',
                                                                    textOverflow: 'ellipsis',
                                                                    display: '-webkit-box',
                                                                    WebkitLineClamp: Math.floor(currentHeight / 24),
                                                                    WebkitBoxOrient: 'vertical'
                                                                }}>
                                                                    {Array.isArray(value)
                                                                        ? value.join(", ")
                                                                        : typeof value === 'object'
                                                                            ? JSON.stringify(value)
                                                                            : String(value)}
                                                                </div>
                                                            </TableCell>
                                                        )
                                                )}
                                                <TableCell
                                                    padding="none"
                                                    sx={{
                                                        position: 'absolute',
                                                        bottom: 0,
                                                        left: 0,
                                                        right: 0,
                                                        height: '4px',
                                                        padding: 0,
                                                        border: 'none'
                                                    }}
                                                >
                                                    <div
                                                        className="resize-handle"
                                                        style={{
                                                            width: '100%',
                                                            height: '100%',
                                                            cursor: 'row-resize',
                                                            backgroundColor: headerBgColor,
                                                            opacity: 0,
                                                            transition: 'opacity 0.2s ease'
                                                        }}
                                                        onMouseDown={(e) => handleMouseDown(rowIndex, e)}
                                                        onMouseEnter={() => setHoveredRow(rowIndex)}
                                                        onMouseLeave={() => setHoveredRow(null)}
                                                    />
                                                </TableCell>
                                            </TableRow>
                                        );
                                    })}
                                </TableBody>
                            </Table>
                        </TableContainer>
                    ) : (
                        <Box sx={{ p: 4, textAlign: 'center' }}>
                            <Typography variant="body1">Нет данных для отображения</Typography>
                        </Box>
                    )}

                    {totalCount > 0 && (
                        <Box sx={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            mt: 2,
                            p: 1,
                            backgroundColor: oddRowBgColor,
                            borderRadius: 1
                        }}>
                            <Typography variant="body2">
                                Показано {offset + 1}-{Math.min(offset + limit, totalCount)} из {totalCount}
                            </Typography>

                            <Pagination
                                count={Math.ceil(totalCount / limit)}
                                page={page}
                                onChange={handlePageChange}
                                sx={{
                                    '& .MuiPaginationItem-root': {
                                        color: headerBgColor,
                                        transition: 'all 0.3s ease',
                                    },
                                    '& .MuiPaginationItem-page.Mui-selected': {
                                        backgroundColor: headerBgColor,
                                        color: headerTextColor,
                                        '&:hover': {
                                            backgroundColor: headerBgColor,
                                            opacity: 0.9
                                        }
                                    },
                                    '& .MuiPaginationItem-page:hover': {
                                        backgroundColor: `${headerBgColor}`,
                                        transform: 'scale(1.05)'
                                    },
                                    '& .MuiPaginationItem-ellipsis': {
                                        color: headerBgColor
                                    }
                                }}
                                showFirstButton
                                showLastButton
                            />

                            <TextField
                                select
                                size="small"
                                value={limit}
                                onChange={(e) => handleApplyLimit(e.target.value)}
                                sx={{ width: 100 }}
                                variant="outlined"
                            >
                                {[5, 8, 10, 15, 20, 25, 50].map((option) => (
                                    <MenuItem key={option} value={option}>
                                        {option} строк
                                    </MenuItem>
                                ))}
                            </TextField>
                        </Box>
                    )}
                </CardContent>
            </Card>
        </Container>
    );
};

export default GenericTable;