import React, { useState, useEffect } from "react";
import axios from "axios";
import DynamicTable from "./for_tables/DynamicTable";
import Filters from "./for_tables/Filters";
import GroupBy from "./for_tables/GroupBy";
import Aggregates from "./for_tables/Aggregates";
import HavingFilters from "./for_tables/HavingFilters";
import SortBy from "./for_tables/SortBy";
import NotNullFilter from "./for_tables/NotNullFilter";
import LimitFilter from "./for_tables/LimitFilter";
import { vacanciesFieldsConfig } from "./configs/vacancies.config";
import "../styles/VacanciesTable.css";



const VacanciesTable = () => {
    const [vacancies, setVacancies] = useState([]);
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
    const [limit, setLimit] = useState(8);
    const [visibleColumns, setVisibleColumns] = useState({});

    const hiddenColumnsByDefault = ["id", "currency", "experience", "archived", "url", "salary_to", "salary_from"];

    useEffect(() => {
        if (vacancies.length > 0) {
            const columns = Object.keys(vacancies[0]);
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
    }, [vacancies, groupBy]);

    useEffect(() => {
        if (vacancies.length > 0) {
            const columns = Object.keys(vacancies[0]);
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

    const fetchVacancies = async (
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

            if (filtersString) {
                params.filters = filtersString;
            }

            if (currentGroupBy) {
                params.group_by = currentGroupBy;
            }

            if (currentAggregates) {
                params.aggregates = currentAggregates;
            }

            if (currentHavingFilters.length > 0) {
                params.having = currentHavingFilters.join("~");
            }

            if (currentSortBy) {
                params.sort_by = currentSortBy;
            }

            if (currentNotNull) {
                params.not_null = currentNotNull;
            }

            const response = await axios.get('http://127.0.0.1:8000/vacancies/table/', {
                params,
            });

            setVacancies(response.data.results);
            setTotalCount(response.data.total_count);
        } catch (error) {
            console.error('Error fetching vacancies:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        console.log("Fetching vacancies with:", {
            offset,
            limit,
            totalCount,
            filters,
            groupBy,
            aggregates,
            havingFilters,
            sortBy,
            notNull,
        });
        fetchVacancies(offset, filters, groupBy, aggregates, havingFilters, sortBy, notNull, limit);
    }, [offset, filters, groupBy, aggregates, havingFilters, sortBy, notNull, limit, totalCount]);

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

        console.log("handlePageChange:", {
            direction,
            currentOffset,
            currentLimit,
            currentTotalCount,
            nextOffset: currentOffset + currentLimit,
            condition: currentOffset + currentLimit < currentTotalCount,
        });

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
        setLimit(8);
        setOffset(0);
        setResetTrigger((prev) => !prev);
        fetchVacancies(0, [], "", "", [], "", "", 8);
    };

    useEffect(() => {
        setSortBy("");
    }, [filters, groupBy, aggregates, havingFilters, notNull]);

    useEffect(() => {
        setOffset(0);
    }, [filters, groupBy, aggregates, havingFilters, sortBy, notNull]);

    if (loading) {
        return <div className="loading">Loading...</div>;
    }

    const columns = Object.keys(vacancies[0] || []);

    return (
        <div className="vacancies-table-container">
            <h1>Вакансии</h1>
            <p>Всего вакансий: {totalCount}</p>

            <button onClick={handleReset} className="reset-btn">
                Очистить всё
            </button>

            <Filters
                filters={filters}
                onAddFilter={handleAddFilter}
                onRemoveFilter={handleRemoveFilter}
                fieldsConfig={vacanciesFieldsConfig}
            />

            <GroupBy
                groupBy={groupBy}
                onApplyGroupBy={handleApplyGroupBy}
                onClearGroupBy={handleClearGroupBy}
                resetTrigger={resetTrigger}
                fieldsConfig={vacanciesFieldsConfig}
            />

            <Aggregates
                aggregates={aggregates}
                onApplyAggregates={handleApplyAggregates}
                fieldsConfig={vacanciesFieldsConfig}
            />

            {groupBy && aggregates && (
                <HavingFilters
                    aggregates={aggregates.split(",")}
                    onAddHavingFilter={handleAddHavingFilter}
                    onRemoveHavingFilter={handleRemoveHavingFilter}
                    havingFilters={havingFilters}
                    fieldsConfig={vacanciesFieldsConfig}
                />
            )}

            <NotNullFilter
                notNull={notNull}
                onApplyNotNullFilter={handleApplyNotNullFilter}
                resetTrigger={resetTrigger}
                fieldsConfig={vacanciesFieldsConfig}
            />

            <SortBy
                columns={columns}
                onApplySortBy={handleApplySortBy}
                sortBy={sortBy}
                fieldsConfig={vacanciesFieldsConfig}
            />

            <DynamicTable
                data={vacancies}
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

export default VacanciesTable;