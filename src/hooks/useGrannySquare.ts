import { clampValue } from '@/utils/numbers';
import { useEffect, useCallback } from 'react';
import { useMediaQuery } from '@joisse1101/ui-library';
import { useMiniTool } from './useMiniTool';

export type GrannyGridState = {
    gridSize: number;
    colourGrid: string[][];
    patternGrid: string[][];
    palette: string[];
};

export type GrannyGridToolState = {
    grannyGridState: GrannyGridState;
    lockedCells: Record<string, boolean>;
    filledCells: Record<string, string>;
    gridSize: string;
    numPatterns: string;
};

const defaultGrannyGridState: GrannyGridState = {
    gridSize: 0,
    colourGrid: [],
    patternGrid: [],
    palette: [],
};

export const useGrannySquare = (instanceId = 'default') => {
    const { toolData, setToolData, isLoading } = useMiniTool('grannySquare', instanceId);

    const grannyGridState: GrannyGridState = toolData?.grannyGridState ?? defaultGrannyGridState;
    const lockedCells: Record<string, boolean> = toolData?.lockedCells ?? {};
    const filledCells: Record<string, string> = toolData?.filledCells ?? {};
    const gridSize: string = toolData?.gridSize ?? '18';
    const numPatterns: string = toolData?.numPatterns ?? '6';

    const updateGrannyGridToolState = useCallback(
        (updates: Partial<GrannyGridToolState>) => {
            setToolData((prevData: GrannyGridToolState) => ({
                ...prevData,
                ...updates,
            }));
        },
        [setToolData]
    );

    useEffect(() => {
        if (!isLoading) {
            console.log('Tool data updated:', toolData);
        }
    }, [toolData, isLoading]);

    const patternsNum = parseInt(numPatterns, 10) || 6;

    const isPhone = !useMediaQuery(600);
    const handleCellLockToggle = (cellKey: string) => {
        const [rowIndex, colIndex] = cellKey.split('-').map((index) => parseInt(index, 10));
        const cellValue = grannyGridState.patternGrid[rowIndex]?.[colIndex];
        const isLocked = lockedCells[cellKey] || false;

        const nextLocked = { ...lockedCells, [cellKey]: !isLocked };
        const nextFilled = { ...filledCells };

        if (!isLocked && cellValue !== undefined) {
            nextFilled[cellKey] = cellValue; // fill input grid cell with cell value
        }
        if (isLocked && isPhone) {
            delete nextFilled[cellKey]; // clear grid cell if unlocked and on phone
        }

        updateGrannyGridToolState({
            lockedCells: nextLocked,
            filledCells: nextFilled,
        });
    };

    const lockFilledCells = () => {
        const updatedLockedCells: Record<string, boolean> = {};
        Object.keys(filledCells).forEach((cellKey) => {
            updatedLockedCells[cellKey] = true;
        });
        updateGrannyGridToolState({ lockedCells: updatedLockedCells });
    };

    const handleClearFilled = () => {
        const nextFilled: Record<string, string> = {};
        Object.keys(filledCells).forEach((cellKey) => {
            if (lockedCells[cellKey]) {
                nextFilled[cellKey] = filledCells[cellKey];
            }
        });
        updateGrannyGridToolState({ filledCells: nextFilled });
    };

    const handleClearLockedCells = () => {
        const nextFilled: Record<string, string> = {};
        Object.keys(filledCells).forEach((cellKey) => {
            if (lockedCells[cellKey]) {
                nextFilled[cellKey] = filledCells[cellKey];
            }
        });
        updateGrannyGridToolState({
            filledCells: nextFilled,
            lockedCells: {},
        });
    };

    const handleRemoveLocks = () => {
        updateGrannyGridToolState({ lockedCells: {} });
    };

    const handleClearGrid = () => {
        updateGrannyGridToolState({ lockedCells: {}, filledCells: {} });
    };

    const handleFillCell = (rowIndex: number, colIndex: number, value: string) => {
        const cellKey = `${rowIndex}-${colIndex}`;
        if (!lockedCells[cellKey]) {
            let finalValue;
            const parsedVal = parseInt(value, 10);
            if (value === '' || isNaN(parsedVal)) finalValue = '';
            else finalValue = clampValue(parsedVal, 1, Math.max(1, patternsNum)).toString();
            updateGrannyGridToolState({
                filledCells: { ...filledCells, [cellKey]: finalValue },
            });
        }
    };

    const setGrannyGridState = (updates: Partial<GrannyGridState>) => {
        setToolData((prevData: GrannyGridToolState) => {
            const currentGrannyState = prevData?.grannyGridState ?? defaultGrannyGridState;

            const nextGridState: GrannyGridState = {
                gridSize: updates.gridSize ?? currentGrannyState.gridSize ?? 0,
                colourGrid: updates.colourGrid ?? currentGrannyState.colourGrid ?? [],
                patternGrid: updates.patternGrid ?? currentGrannyState.patternGrid ?? [],
                palette: updates.palette ?? currentGrannyState.palette ?? [],
            };

            return {
                ...prevData,
                grannyGridState: nextGridState,
            };
        });
    };

    const setFilledCells = (updates: Record<string, string>) => {
        updateGrannyGridToolState({ filledCells: updates });
    };

    const setGridSize = (updates: string) => {
        updateGrannyGridToolState({ gridSize: updates });
    };

    const setNumPatterns = (updates: string) => {
        updateGrannyGridToolState({ numPatterns: updates });
    };

    return {
        isLoading,
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