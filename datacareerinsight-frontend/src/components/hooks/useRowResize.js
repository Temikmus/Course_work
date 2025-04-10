// src/hooks/useRowResize.js
import { useState, useEffect, useCallback } from 'react';

export const useRowResize = (defaultHeight = 48) => {
    const [rowHeights, setRowHeights] = useState({});
    const [activeRow, setActiveRow] = useState(null);
    const [startY, setStartY] = useState(0);
    const [startHeight, setStartHeight] = useState(0);
    const [hoveredRow, setHoveredRow] = useState(null);
    const MAX_HEIGHT = 300;

    const handleMouseDown = (rowIndex, e) => {
        setActiveRow(rowIndex);
        setStartY(e.clientY);
        setStartHeight(rowHeights[rowIndex] || defaultHeight);
        document.body.style.cursor = 'row-resize';
        document.body.style.userSelect = 'none';
    };

    const handleMouseMove = useCallback((e) => {
        if (activeRow !== null) {
            const newHeight = Math.min(
                MAX_HEIGHT,
                Math.max(defaultHeight, startHeight + (e.clientY - startY))
            );
            setRowHeights(prev => ({
                ...prev,
                [activeRow]: newHeight
            }));
        }
    }, [activeRow, startY, startHeight, defaultHeight]);

    const handleMouseUp = useCallback(() => {
        setActiveRow(null);
        document.body.style.cursor = '';
        document.body.style.userSelect = '';
    }, []);

    useEffect(() => {
        document.addEventListener('mousemove', handleMouseMove);
        document.addEventListener('mouseup', handleMouseUp);
        return () => {
            document.removeEventListener('mousemove', handleMouseMove);
            document.removeEventListener('mouseup', handleMouseUp);
        };
    }, [handleMouseMove, handleMouseUp]);

    return {
        rowHeights,
        handleMouseDown,
        hoveredRow,
        setHoveredRow,
        isResizing: activeRow !== null
    };
};