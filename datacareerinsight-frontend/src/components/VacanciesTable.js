import React, { useState, useEffect } from "react";
import axios from "axios";
import DynamicTable from "./DynamicTable";
import Filters from "./Filters";
import GroupBy from "./GroupBy";
import Aggregates from "./Aggregates";
import HavingFilters from "./HavingFilters";
import SortBy from "./SortBy";
import NotNullFilter from "./NotNullFilter"; // Импортируем новый компонент
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
    const [resetTrigger, setResetTrigger] = useState(false); // Триггер для сброса состояния
    const [notNull, setNotNull] = useState(""); // Состояние для фильтра not_null

    const fetchVacancies = async (
        currentOffset,
        currentFilters,
        currentGroupBy,
        currentAggregates,
        currentHavingFilters,
        currentSortBy,
        currentNotNull // Новый параметр для not_null
    ) => {
        try {
            const filtersString = currentFilters
                .map((filter) => `${filter.field}${filter.operator}${filter.logic}:${filter.value}`)
                .join(";");

            const params = {
                offset: currentOffset,
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
                params.not_null = currentNotNull; // Добавляем параметр not_null
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
        fetchVacancies(offset, filters, groupBy, aggregates, havingFilters, sortBy, notNull);
    }, [offset, filters, groupBy, aggregates, havingFilters, sortBy, notNull]);

    const handleAddFilter = (newFilter) => {
        setFilters([...filters, newFilter]);
    };

    const handleRemoveFilter = (index) => {
        setFilters(filters.filter((_, i) => i !== index));
    };

    const handlePageChange = (direction) => {
        if (direction === 'next' && offset + 15 < totalCount) {
            setOffset(offset + 15);
        } else if (direction === 'prev' && offset - 15 >= 0) {
            setOffset(offset - 15);
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

    // Обработчик для применения фильтра not_null
    const handleApplyNotNullFilter = (notNullValue) => {
        setNotNull(notNullValue); // Обновляем состояние not_null
    };

    const handleReset = () => {
        setFilters([]); // Очищаем фильтры
        setGroupBy(""); // Очищаем группировку
        setAggregates(""); // Очищаем агрегации
        setHavingFilters([]); // Очищаем HAVING-фильтры
        setSortBy(""); // Очищаем сортировку
        setNotNull(""); // Очищаем фильтр not_null
        setOffset(0); // Сбрасываем пагинацию
        setResetTrigger((prev) => !prev); // Изменяем триггер для сброса
        fetchVacancies(0, [], "", "", [], "", ""); // Делаем запрос без параметров
    };

    // Сброс сортировки после каждого запроса
    useEffect(() => {
        setSortBy(""); // Очищаем сортировку после каждого запроса
    }, [filters, groupBy, aggregates, havingFilters]);

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
                resetTrigger={resetTrigger} // Передаем триггер для сброса
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

            {/* Новый компонент для фильтра not_null */}
            <NotNullFilter
                notNull={notNull} // Передаем текущее значение not_null
                onApplyNotNullFilter={handleApplyNotNullFilter}
                resetTrigger={resetTrigger} // Передаем триггер для сброса
            />

            <SortBy
                columns={columns}
                onApplySortBy={handleApplySortBy}
                sortBy={sortBy}
            />

            <DynamicTable data={vacancies} />

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
                    disabled={offset + 15 >= totalCount}
                    className="pagination-btn"
                >
                    Следующая страница
                </button>
            </div>
        </div>
    );
};

export default VacanciesTable;