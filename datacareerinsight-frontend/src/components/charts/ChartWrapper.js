import React from 'react';
import Filters from '../for_tables/Filters';

export const ChartWrapper = ({
                                 title,
                                 model,
                                 children,
                                 filtersConfig,
                                 filters,
                                 onAddFilter,
                                 onRemoveFilter,
                                 onClearFilters,
                                 additionalControls
                             }) => {
    return (
        <div className="chart-container">
            <div className="chart-header">
                <h2>{title}</h2>
                <div className="chart-controls">
                    {additionalControls}
                    {filters.length > 0 && (
                        <button onClick={onClearFilters}>Очистить фильтры</button>
                    )}
                </div>
            </div>

            <Filters
                filters={filters}
                onAddFilter={onAddFilter}
                onRemoveFilter={onRemoveFilter}
                fieldsConfig={filtersConfig}
            />

            <div className="chart-content">
                {children}
            </div>
        </div>
    );
};