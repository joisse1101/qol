import React from 'react';
import { downloadGridCSV } from '@utils/csv';
import { useMediaQuery } from '@joisse1101/ui-library';
import { CLEAR_FILLED_CELLS_TOOLTIP, DOWNLOAD_INPUT_TOOLTIP, UNLOCK_CELLS_TOOLTIP, CLEAR_GRID_TOOLTIP } from '@/constants/grannySquareTooltips';
import { showUploadDownloadToast } from '@/constants/toastConstants';

export type CellColour = string | [string, string];

export interface InputGridProps {
    filledCells: Record<string, string>;
    setFilledCells: React.Dispatch<React.SetStateAction<Record<string, string>>>;
    gridSize: number;
    maxInput: number;
    lockedCells: Record<string, boolean>;
    handleClearGrid: () => void;
    handleFillCell: (rowIndex: number, colIndex: number, value: string) => void;
    handleClearFilled: () => void;
    handleRemoveLocks: () => void;
}


export const InputGrid: React.FC<InputGridProps> = ({ filledCells, gridSize, maxInput, lockedCells, handleClearGrid, handleFillCell, handleClearFilled, handleRemoveLocks }) => {

    const downloadGridAsCSV = () => {
        // Guard against missing or zero dimensions
        if (!gridSize || typeof gridSize !== 'number' || gridSize <= 0) {
            console.error('Cannot download CSV: Invalid grid size.');
            showUploadDownloadToast('download', false);
            return;
        }

        const filename = 'grid_data.csv';

        // Construct raw 2D array of strings - downloadGridCSV will handle escaping & safety
        const csvData = Array.from({ length: gridSize }, (_, rowIdx) =>
            Array.from({ length: gridSize }, (_, colIdx) => {
                const cellKey = `${rowIdx}-${colIdx}`;
                return filledCells?.[cellKey] ?? '';
            })
        );

        try {
            downloadGridCSV(csvData, filename);
            showUploadDownloadToast('download', true);
        } catch (error) {
            console.error('Error downloading CSV:', error);
            showUploadDownloadToast('download', false);
        }
    };

    const isGridEmpty = Object.keys(filledCells).length === 0;
    const isPhone = !useMediaQuery(600);

    return (
        <>
            <div className='btn-container'>
                <button className='btn btn-primary' onClick={downloadGridAsCSV} title={DOWNLOAD_INPUT_TOOLTIP} disabled={isGridEmpty}>
                    Download Grid
                </button>
                <div className='btn-wrapper'>
                    <button className='btn btn-secondary' onClick={handleRemoveLocks} title={UNLOCK_CELLS_TOOLTIP}>
                        Unlock Cells
                    </button>
                    <button className='btn btn-danger-outline' onClick={handleClearFilled} title={CLEAR_FILLED_CELLS_TOOLTIP}>
                        Clear Unlocked Cells
                    </button>
                    <button className='btn btn-danger' onClick={handleClearGrid} title={CLEAR_GRID_TOOLTIP}>
                        Clear Grid
                    </button>
                </div>

            </div>
            <div
                className="granny-grid"
                style={{
                    '--grid-size': gridSize,
                } as React.CSSProperties}
            >
                {Array.from({ length: gridSize }, (_, rowIdx) => (
                    <React.Fragment key={rowIdx}>
                        {Array.from({ length: gridSize }, (_, colIdx) => {
                            const cellKey = `${rowIdx}-${colIdx}`;
                            const cellValue = filledCells[cellKey];
                            return (
                                <div key={cellKey} className="grid-cell">
                                    {!isPhone ? (
                                        <input
                                            className="no-spinner"
                                            type="number"
                                            min={0}
                                            max={maxInput}
                                            value={cellValue ?? ''}
                                            onChange={(e) =>
                                                handleFillCell(rowIdx, colIdx, e.target.value)
                                            }
                                            disabled={lockedCells[cellKey]}
                                        />
                                    ) : (
                                        <div>{cellValue}</div>
                                    )}
                                </div>
                            )
                        })}
                    </React.Fragment>
                ))}
            </div>
        </>
    );
};