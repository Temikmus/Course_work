import React, { useState, useEffect } from "react";
import axios from "axios";
import DynamicTable from "./DynamicTable";
import Filters from "./Filters";
import GroupBy from "./GroupBy";
import Aggregates from "./Aggregates";
import HavingFilters from "./HavingFilters";
import SortBy from "./SortBy";
import NotNullFilter from "./NotNullFilter";
import LimitFilter from "./LimitFilter";
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
    const [limit, setLimit] = useState(8); // Значение по умолчанию = 8

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
                offset: Number(currentOffset), // Преобразуем в число
                limit: Number(currentLimit),   // Преобразуем в число
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
    }, [offset, filters, groupBy, aggregates, havingFilters, sortBy, notNull, limit, totalCount]); // Добавили totalCount в зависимости

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

    // Обработчик для применения лимита
    const handleApplyLimit = (newLimit) => {
        setLimit(newLimit); // Обновляем состояние limit
        setOffset(0); // Сбрасываем offset при изменении limit
    };

    const handleReset = () => {
        setFilters([]);
        setGroupBy("");
        setAggregates("");
        setHavingFilters([]);
        setSortBy("");
        setNotNull("");
        setLimit(8); // Сбрасываем limit на значение по умолчанию
        setOffset(0);
        setResetTrigger((prev) => !prev); // Изменяем триггер для сброса
        fetchVacancies(0, [], "", "", [], "", "", 8); // Делаем запрос с limit по умолчанию
    };

    // Сброс сортировки после каждого запроса
    useEffect(() => {
        setSortBy(""); // Очищаем сортировку
    }, [filters, groupBy, aggregates, havingFilters, notNull]);

    // Сброс offset после каждого запроса
    useEffect(() => {
        setOffset(0);  // Сбрасываем offset
    }, [filters, groupBy, aggregates, havingFilters, sortBy, notNull]); // Добавили sortBy в зависимости

    if (loading) {
        return <div className="loading">Loading...</div>;
    }

    // Получаем список столбцов для сортировки
    const columns = Object.keys(vacancies[0] || []);

    return (
        <div className="vacancies-table-container">
            <h1>Вакансии</h1>
            <p>Всего вакансий: {totalCount}</p>

            <button onClick={handleReset} className="reset-btn">
                Сбросить фильтры и группировку
            </button>

            <Filters
                filters={filters}
                onAddFilter={handleAddFilter}
                onRemoveFilter={handleRemoveFilter}
            />

            <GroupBy
                groupBy={groupBy}
                onApplyGroupBy={handleApplyGroupBy}
                onClearGroupBy={handleClearGroupBy}
                resetTrigger={resetTrigger}
            />

            <Aggregates
                aggregates={aggregates}
                onApplyAggregates={handleApplyAggregates}
            />

            {groupBy && aggregates && (
                <HavingFilters
                    aggregates={aggregates.split(",")}
                    onAddHavingFilter={handleAddHavingFilter}
                    onRemoveHavingFilter={handleRemoveHavingFilter}
                    havingFilters={havingFilters}
                />
            )}

            <NotNullFilter
                notNull={notNull}
                onApplyNotNullFilter={handleApplyNotNullFilter}
                resetTrigger={resetTrigger}
            />

            <SortBy
                columns={columns}
                onApplySortBy={handleApplySortBy}
                sortBy={sortBy}
            />

            <DynamicTable data={vacancies} />

            {/* Новый компонент для лимита */}
            <LimitFilter
                limit={limit}
                onApplyLimit={handleApplyLimit}
                resetTrigger={resetTrigger} // Передаем триггер для сброса
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