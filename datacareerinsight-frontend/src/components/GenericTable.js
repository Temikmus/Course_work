import React, { useState, useEffect } from 'react';
import axios from 'axios';
import DynamicTable from './for_tables/DynamicTable';
import Filters from './for_tables/Filters';
import GroupBy from './for_tables/GroupBy';
import Aggregates from './for_tables/Aggregates';
import HavingFilters from './for_tables/HavingFilters';
import SortBy from './for_tables/SortBy';
import NotNullFilter from './for_tables/NotNullFilter';
import LimitFilter from './for_tables/LimitFilter';

const GenericTable = ({
                          title = "Данные",
                          apiEndpoint,
                          fieldsConfig,
                          hiddenColumnsByDefault = [],
                          defaultLimit = 8
                      }) => {
    // Все состояния
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

    // Инициализация видимых колонок (полная версия)
    useEffect(() => {
        if (data.length > 0) {
            const columns = Object.keys(data[0]);
            const initialVisibility = {};

            columns.forEach((column) => {
                if (visibleColumns[column] !== undefined) {
                    initialVisibility[column] = visibleColumns[column];
                } else {
                    initialVisibility[column] = !hiddenColumnsByDefault.includes(column);
                }
            });

            if (groupBy) {
                initialVisibility[groupBy] = true;
            }

            setVisibleColumns(initialVisibility);
        }
    }, [data, groupBy]);

    useEffect(() => {
        if (data.length > 0) {
            const columns = Object.keys(data[0]);
            const initialVisibility = {};

            columns.forEach((column) => {
                initialVisibility[column] = !hiddenColumnsByDefault.includes(column);
            });

            if (groupBy) {
                initialVisibility[groupBy] = true;
            }

            setVisibleColumns(initialVisibility);
        }
    }, [resetTrigger]);

    // Полная версия fetchData
    const fetchData = async (
        currentOffset,
        currentFilters,
        currentGroupBy,
        currentAggregates,
        currentHavingFilters,
        currentSortBy,
        currentNotNull,
        currentLimit
    ) => {
        try {
            const filtersString = currentFilters
                .map((filter) => `${filter.field}${filter.operator}${filter.logic}:${filter.value}`)
                .join(";");

            const params = {
                offset: Number(currentOffset),
                limit: Number(currentLimit),
            };

            if (filtersString) params.filters = filtersString;
            if (currentGroupBy) params.group_by = currentGroupBy;
            if (currentAggregates) params.aggregates = currentAggregates;
            if (currentHavingFilters?.length > 0) params.having = currentHavingFilters.join("~");
            if (currentSortBy) params.sort_by = currentSortBy;
            if (currentNotNull) params.not_null = currentNotNull;

            const response = await axios.get(apiEndpoint, { params });
            setData(response.data.results);
            setTotalCount(response.data.total_count);
        } catch (error) {
            console.error(`Ошибка загрузки ${title.toLowerCase()}:`, error);
        } finally {
            setLoading(false);
        }
    };

    // Все обработчики (полные версии)
    const handleAddFilter = (newFilter) => {
        setFilters([...filters, newFilter]);
    };

    const handleRemoveFilter = (index) => {
        setFilters(filters.filter((_, i) => i !== index));
    };

    const handlePageChange = (direction) => {
        const currentOffset = Number(offset);
        const currentLimit = Number(limit);
        const currentTotalCount = Number(totalCount);

        if (direction === 'next' && currentOffset + currentLimit < currentTotalCount) {
            setOffset(currentOffset + currentLimit);
        } else if (direction === 'prev' && currentOffset - currentLimit >= 0) {
            setOffset(currentOffset - currentLimit);
        }
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
        setResetTrigger((prev) => !prev);
    };

    // Все эффекты (полные версии)
    useEffect(() => {
        fetchData(offset, filters, groupBy, aggregates, havingFilters, sortBy, notNull, limit);
    }, [offset, filters, groupBy, aggregates, havingFilters, sortBy, notNull, limit]);

    useEffect(() => {
        setSortBy("");
    }, [filters, groupBy, aggregates, havingFilters, notNull]);

    useEffect(() => {
        setOffset(0);
    }, [filters, groupBy, aggregates, havingFilters, sortBy, notNull]);

    if (loading) return <div className="loading">Загрузка...</div>;

    // Полная версия JSX
    return (
        <div className="table-container">
            <h1>{title}</h1>
            <p>Всего записей: {totalCount}</p>

            <button onClick={handleReset} className="reset-btn">
                Очистить всё
            </button>

            <Filters
                filters={filters}
                onAddFilter={handleAddFilter}
                onRemoveFilter={handleRemoveFilter}
                fieldsConfig={fieldsConfig}
            />

            <GroupBy
                groupBy={groupBy}
                onApplyGroupBy={handleApplyGroupBy}
                onClearGroupBy={handleClearGroupBy}
                resetTrigger={resetTrigger}
                fieldsConfig={fieldsConfig}
            />

            <Aggregates
                aggregates={aggregates}
                onApplyAggregates={handleApplyAggregates}
                fieldsConfig={fieldsConfig}
            />

            {groupBy && aggregates && (
                <HavingFilters
                    aggregates={aggregates.split(",")}
                    onAddHavingFilter={handleAddHavingFilter}
                    onRemoveHavingFilter={handleRemoveHavingFilter}
                    havingFilters={havingFilters}
                    fieldsConfig={fieldsConfig}
                />
            )}

            <NotNullFilter
                notNull={notNull}
                onApplyNotNullFilter={handleApplyNotNullFilter}
                resetTrigger={resetTrigger}
                fieldsConfig={fieldsConfig}
            />

            <SortBy
                columns={Object.keys(data[0] || [])}
                onApplySortBy={handleApplySortBy}
                sortBy={sortBy}
                fieldsConfig={fieldsConfig}
            />

            <DynamicTable
                data={data}
                visibleColumns={visibleColumns}
                onToggleColumn={(column) => {
                    setVisibleColumns((prev) => ({
                        ...prev,
                        [column]: !prev[column],
                    }));
                }}
            />

            <LimitFilter
                limit={limit}
                onApplyLimit={handleApplyLimit}
                resetTrigger={resetTrigger}
            />

            <div className="pagination">
                <button
                    onClick={() => handlePageChange('prev')}
                    disabled={offset === 0}
                    className="pagination-btn"
                >
                    Предыдущая страница
                </button>
                <button
                    onClick={() => handlePageChange('next')}
                    disabled={Number(offset) + Number(limit) >= Number(totalCount)}
                    className="pagination-btn"
                >
                    Следующая страница
                </button>
            </div>
        </div>
    );
};

export default GenericTable;