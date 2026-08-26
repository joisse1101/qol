import { clampValue } from '@/utils/numbers';
import { getStorageItem } from '@/utils/storage';
import { useEffect, useState } from 'react';

export type GrannyGridState = {
    gridSize: number;
    colourGrid: string[][];
    patternGrid: string[][];
    palette: string[];
};

const defaultGrannyGridState: GrannyGridState = {
    gridSize: 0,
    colourGrid: [],
    patternGrid: [],
    palette: [],
};

const STORAGE_KEYS = {
    GRANNY_STATE: 'granny_grid_state',
    LOCKED_CELLS: 'granny_locked_cells',
    FILLED_CELLS: 'granny_filled_cells',
    GRID_SIZE: 'granny_grid_size',
    NUM_PATTERNS: 'granny_num_patterns',
};



export const useGrannySquare = () => {
    const [grannyGridState, setGrannyGridState] = useState<GrannyGridState>(() =>
        getStorageItem(STORAGE_KEYS.GRANNY_STATE, defaultGrannyGridState)
    );
    const [lockedCells, setLockedCells] = useState<Record<string, boolean>>(() =>
        getStorageItem(STORAGE_KEYS.LOCKED_CELLS, {})
    );
    const [filledCells, setFilledCells] = useState<Record<string, string>>(() =>
        getStorageItem(STORAGE_KEYS.FILLED_CELLS, {})
    );
    const [gridSize, setGridSize] = useState<string>(() =>
        getStorageItem(STORAGE_KEYS.GRID_SIZE, '18')
    );
    const [numPatterns, setNumPatterns] = useState<string>(() =>
        getStorageItem(STORAGE_KEYS.NUM_PATTERNS, '6')
    );
    const patternsNum = parseInt(numPatterns, 10);

    useEffect(() => {
        localStorage.setItem(STORAGE_KEYS.GRANNY_STATE, JSON.stringify(grannyGridState));
    }, [grannyGridState]);

    useEffect(() => {
        localStorage.setItem(STORAGE_KEYS.LOCKED_CELLS, JSON.stringify(lockedCells));
    }, [lockedCells]);

    useEffect(() => {
        localStorage.setItem(STORAGE_KEYS.FILLED_CELLS, JSON.stringify(filledCells));
    }, [filledCells]);

    useEffect(() => {
        localStorage.setItem(STORAGE_KEYS.GRID_SIZE, JSON.stringify(gridSize));
    }, [gridSize]);

    useEffect(() => {
        localStorage.setItem(STORAGE_KEYS.NUM_PATTERNS, JSON.stringify(numPatterns));
    }, [numPatterns]);

    const handleCellLockToggle = (cellKey: string) => {
        const [rowIndex, colIndex] = cellKey.split('-').map((index) => parseInt(index, 10));
        const cellValue = grannyGridState.patternGrid[rowIndex]?.[colIndex];
        const isLocked = lockedCells[cellKey] || false;
        setLockedCells((prev) => ({ ...prev, [cellKey]: !prev[cellKey] }));
        if (!isLocked && cellValue !== undefined) {
            setFilledCells((prev) => ({ ...prev, [cellKey]: cellValue }));
        }
    };

    const lockFilledCells = () => {
        const updatedLockedCells: Record<string, boolean> = {};
        Object.keys(filledCells).forEach((cellKey) => {
            updatedLockedCells[cellKey] = true;
        });
        setLockedCells(updatedLockedCells);
    };

    const handleClearFilled = () => {
        setFilledCells((prev) => {
            const next = { ...prev };
            Object.keys(prev).forEach((cellKey) => {
                if (!lockedCells[cellKey]) {
                    delete next[cellKey];
                }
            });
            return next;
        });
    };

    const handleClearLockedCells = () => {
        setFilledCells((prev) => {
            const next = { ...prev };
            Object.keys(lockedCells).forEach((cellKey) => {
                delete next[cellKey];
            });
            return next;
        });
        setLockedCells({});
    };

    const handleRemoveLocks = () => {
        setLockedCells({});
    };

    const handleClearGrid = () => {
        setLockedCells({});
        setFilledCells({});
    }

    const handleFillCell = (rowIndex: number, colIndex: number, value: string) => {
        const cellKey = `${rowIndex}-${colIndex}`;
        if (!lockedCells[cellKey]) {
            const clampedValue = clampValue(parseInt(value, 10), 1, patternsNum - 1).toString();
            setFilledCells((prev) => ({ ...prev, [cellKey]: clampedValue }));
        }
    };

    return {
        grannyGridState,
        setGrannyGridState,
        lockedCells,
        filledCells,
        setFilledCells,
        gridSize,
        setGridSize,
        numPatterns,
        setNumPatterns,
        handleCellLockToggle,
        lockFilledCells,
        handleClearGrid,
        handleFillCell,
        handleClearFilled,
        handleClearLockedCells,
        handleRemoveLocks,
    };
};