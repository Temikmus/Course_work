import React, { useState, useRef } from 'react';
import { TableRow } from '@mui/material';

export const ResizableTableRow = ({ children, defaultHeight = 48, onHeightChange }) => {
    const [height, setHeight] = useState(defaultHeight);
    const startYRef = useRef(0);
    const startHeightRef = useRef(0);
    const [isResizing, setIsResizing] = useState(false);

    const handleMouseDown = (e) => {
        if (e.target.dataset.resize === 'handle') {
            setIsResizing(true);
            startYRef.current = e.clientY;
            startHeightRef.current = height;
            document.addEventListener('mousemove', handleMouseMove);
            document.addEventListener('mouseup', handleMouseUp);
            e.preventDefault();
        }
    };

    const handleMouseMove = (e) => {
        const newHeight = startHeightRef.current + (e.clientY - startYRef.current);
        const finalHeight = Math.max(48, newHeight);
        setHeight(finalHeight);
        if (onHeightChange) onHeightChange(finalHeight);
    };

    const handleMouseUp = () => {
        setIsResizing(false);
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
    };

    return (
        <TableRow
            style={{ height }}
            onMouseDown={handleMouseDown}
            sx={{
                backgroundColor: isResizing ? 'action.hover' : 'inherit',
                position: 'relative',
                '&:hover::after': {
                    content: '""',
                    position: 'absolute',
                    bottom: 0,
                    left: 0,
                    right: 0,
                    height: '4px',
                    backgroundColor: 'primary.main',
                    cursor: 'row-resize',
                },
                '&::after': {
                    content: '""',
                    position: 'absolute',
                    bottom: 0,
                    left: 0,
                    right: 0,
                    height: '2px',
                    backgroundColor: 'divider',
                }
            }}
            data-resize="handle"
        >
            {children}
        </TableRow>
    );
};