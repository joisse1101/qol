import { ColourPalettePicker } from "@joisse1101/ui-library";
import { UPLOAD_INPUT_TOOLTIP } from "@/constants/grannySquareTooltips";
import { showUploadDownloadToast } from "@/constants/toastConstants";
import { useMediaQuery } from "@joisse1101/ui-library";
import type { GrannyGridState } from "@/hooks/useGrannySquare";
import { parseGridCSV } from "@/utils/csv";
import { useRef, useState, type ChangeEvent } from "react";

export interface ControlPanelProps {
    gridSize: string;
    setGridSize: (size: string) => void;
    numPatterns: string;
    setNumPatterns: (num: string) => void;
    filledCells: Record<string, string>;
    setFilledCells: (filledCells: Record<string, string>) => void;
    isLoading: boolean;
    setGenerationLogs: (logs: string[]) => void;
    setActiveTab: (tab: string) => void;
    setIsOutputDisabled: (disabled: boolean) => void;
    setGrannyGridState: (state: GrannyGridState) => void;
    lockFilledCells: () => void;
}



export const ControlPanel: React.FC<ControlPanelProps> = ({
    gridSize,
    setGridSize,
    numPatterns,
    setNumPatterns,
    filledCells,
    setFilledCells,
    isLoading,
    setGenerationLogs,
    setActiveTab,
    setIsOutputDisabled,
    setGrannyGridState,
    lockFilledCells,
}) => {
    const isDesktop = useMediaQuery(600);
    const maxGridSize = isDesktop ? 24 : 18; // Limit grid size for mobile devices

    const [isGenerating, setIsGenerating] = useState<boolean>(false);

    const [colors, setColors] = useState<string[]>([]);

    const [errors, setErrors] = useState<string[]>([]);

    const validateInputs = (): boolean => {
        const gridSizeNum = parseInt(gridSize, 10);
        const numPatternsNum = parseInt(numPatterns, 10);
        const errors: string[] = [];
        if (isNaN(gridSizeNum) || gridSizeNum <= 0 || gridSizeNum > maxGridSize) {
            errors.push(`Invalid grid size. Please enter a positive integer between 0 and ${maxGridSize}.`);
        }
        if (isNaN(numPatternsNum) || numPatternsNum <= 0 || numPatternsNum > maxGridSize) {
            errors.push(`Invalid number of patterns. Please enter a positive integer between 0 and ${maxGridSize}.`);
        }
        if (colors.length === 0) {
            errors.push('Please select at least one color for the palette.');
        }
        if (errors.length > 0) {
            setErrors(errors);
            return false;
        }
        setErrors([]);
        return true;
    };

    const handleGenerate = async () => {
        if (!validateInputs()) {
            setGenerationLogs(['Input validation failed. Please correct the errors and try again.']);
            return;
        }

        setActiveTab('logs-tab');
        const gridSizeNum = parseInt(gridSize, 10);
        const numPatternsNum = parseInt(numPatterns, 10);

        if (gridSizeNum > 0 && numPatternsNum > 0 && colors.length > 0) {
            setIsOutputDisabled(true);
            setIsGenerating(true);
            if (window.generateGrannySquare) {
                setGenerationLogs(['Generating granny square...']);

                const patternGrid: (number | undefined)[][] = Array.from({ length: gridSizeNum }, (_, rowIdx) =>
                    Array.from({ length: gridSizeNum }, (_, colIdx) => {
                        const cellKey = `${rowIdx}-${colIdx}`;
                        if (filledCells[cellKey]) {
                            const cellValue = parseInt(filledCells[cellKey], 10);
                            if (!isNaN(cellValue)) {
                                return cellValue - 1; // Convert to 0-based index
                            }
                        }
                        return undefined;
                    })
                );
                const result = await window.generateGrannySquare(
                    gridSizeNum,
                    colors,
                    numPatternsNum,
                    patternGrid
                );
                setGrannyGridState({
                    gridSize: gridSizeNum,
                    colourGrid: result.colourGrid,
                    patternGrid: result.patternGrid,
                    palette: colors,
                });

                lockFilledCells();

                setIsOutputDisabled(false);
                setTimeout(() => setActiveTab('output-tab'), 500);
            } else {
                setGenerationLogs(['Something went wrong.', 'generateGrannySquare function is not available on window.']);
            }
            setTimeout(() => setIsGenerating(false), 500);
        }

    };

    return (
        <div className="card card-control-panel">
            <div id="form-grid" className="form-grid">
                <div className="form-group">
                    <label htmlFor="gridSize">Grid Size</label>
                    <input type="number" id="gridSize" value={gridSize}
                        onChange={(e) => setGridSize(e.target.value)}
                        disabled={isLoading} />
                </div>
                <div className="form-group">
                    <label htmlFor="numPatterns">Number of Patterns</label>
                    <input type="number" id="numPatterns" value={numPatterns}
                        onChange={(e) => setNumPatterns(e.target.value)}
                        disabled={isLoading} />
                </div>
                <details id="colour-picker-details" className={`color-picker-accordion ${isLoading ? 'disabled' : ''}`}>
                    <summary className={`accordion-header ${isLoading ? 'disabled' : ''}`}>Colour Settings / Palette</summary>
                    <ColourPalettePicker onChange={(newPalette: string[]) => setColors(newPalette)} />
                </details>
                {errors.length > 0 && (
                    <div className="error-messages">
                        {errors.map((error, index) => (
                            <div key={index} className="error-message">{error}</div>
                        ))}
                    </div>
                )}
            </div>
            <div className="btn-container">
                {isLoading ?
                    <button id="loadingBtn" className="btn btn-primary" type="button" disabled={true} onClick={handleGenerate}>
                        Loading...
                    </button>
                    :
                    <>
                        <DownloadAndUploadButtons
                            gridSize={parseInt(gridSize)}
                            maxInput={numPatterns ? parseInt(numPatterns) : 0}
                            setActiveTab={setActiveTab}
                            setFilledCells={setFilledCells}
                        />
                        <button id="submitBtn" className="btn btn-primary" type="button" disabled={isGenerating} onClick={handleGenerate}>
                            {'Generate Square'}
                        </button>
                    </>
                }
            </div>
        </div>
    )
}

const DownloadAndUploadButtons: React.FC<{
    gridSize: number;
    maxInput: number;
    setActiveTab: (tab: string) => void;
    setFilledCells: (filledCells: Record<string, string>) => void;
}> = ({ gridSize, maxInput, setActiveTab, setFilledCells }) => {
    const fileInputRef = useRef<HTMLInputElement>(null);

    const onUpload = (event: ChangeEvent<HTMLInputElement>) => {
        const target = event.target;
        const file = target.files?.[0];

        // Defensive check for missing file, grid dimensions, or clamping limit
        if (!file || !gridSize || typeof maxInput !== 'number') return;

        const reader = new FileReader();

        reader.onload = (e) => {
            try {
                const content = e.target?.result as string;
                if (!content) return;

                const parsedData = parseGridCSV(content, gridSize);
                if (!Array.isArray(parsedData)) {
                    throw new Error('Parsed data is not a valid 2D grid structure.');
                }

                const newFilledCells: Record<string, string> = {};

                parsedData.forEach((row, rowIdx) => {
                    if (!Array.isArray(row)) return;

                    row.forEach((cell, colIdx) => {
                        const trimmed = cell?.toString().trim();
                        if (!trimmed) return;

                        const cellValue = parseInt(trimmed, 10);

                        if (!Number.isNaN(cellValue)) {
                            // Clamp value strictly between 1 and maxInput
                            const clampedValue = Math.min(Math.max(cellValue, 1), maxInput);
                            const cellKey = `${rowIdx}-${colIdx}`;
                            newFilledCells[cellKey] = clampedValue.toString();
                        }
                    });
                });

                setFilledCells(newFilledCells);
                setActiveTab('patterns-tab');
                showUploadDownloadToast('upload', true);
            } catch (err) {
                console.error('Failed to parse uploaded grid file:', err);
                showUploadDownloadToast('upload', false);
            } finally {
                target.value = '';
            }
        };

        reader.onerror = () => {
            console.error('FileReader error:', reader.error);
            showUploadDownloadToast('upload', false);
            target.value = '';
        };

        reader.readAsText(file);
    };

    const handleUploadButtonClick = () => {
        fileInputRef.current?.click();
    };

    return (
        <div className="btn-wrapper">
            <input
                type="file"
                ref={fileInputRef}
                accept=".csv,text/csv,text/plain,application/csv,text/comma-separated-values"
                onChange={onUpload}
                style={{ display: 'none' }}
            />
            <button className="btn btn-secondary" type="button" onClick={handleUploadButtonClick} title={UPLOAD_INPUT_TOOLTIP}>
                {'Upload Grid'}
            </button>
        </div>
    )

}