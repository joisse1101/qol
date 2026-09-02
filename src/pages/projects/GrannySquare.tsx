import { useEffect, useState } from 'react';
import { Tabs, type TabItem } from '@joisse1101/ui-library';
import { GrannyGrid } from '@/components/partials/grannySquare/GrannyGrid';
import { PaletteDisplay } from '@/components/partials/grannySquare/PaletteDisplay';
import { ControlPanel } from '@/components/partials/grannySquare/ControlPanel';
import { InputGrid } from '@/components/InputGrid';
import { useGrannySquare } from '@/hooks/useGrannySquare';
import { useMediaQuery } from '@joisse1101/ui-library';

// Extend Window so TypeScript doesn't throw errors
declare global {
    interface Window {
        generateGrannySquare?: (gridSize: number, colors: string[], numPatterns: number, patternGrid?: (number | undefined)[][]) => Promise<{ colourGrid: string[][]; patternGrid: string[][] }>;
        addLogs?: (log: string[]) => void;
    }
}

export default function GrannySquare() {
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [generationLogs, setGenerationLogs] = useState<string[]>([]);

    const {
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
    } = useGrannySquare();

    const [activeTab, setActiveTab] = useState<string>('logs-tab');
    const [isOutputDisabled, setIsOutputDisabled] = useState<boolean>(grannyGridState.colourGrid.length === 0 || grannyGridState.patternGrid.length === 0);
    const [selectedColour, setSelectedColour] = useState<string | null>(null);
    const [hoveredColour, setHoveredColour] = useState<string | null>(null);

    useEffect(() => {
        window.addLogs = (log: string[]) => {
            const newLogs = Array.from(log);
            setGenerationLogs((prevLogs) => [...prevLogs, ...newLogs]);
        };

        const handleAppReady = () => {
            setIsLoading(false);
        };

        document.addEventListener('py-app-ready', handleAppReady);

        const pyScript = document.createElement('script');
        pyScript.type = 'py';
        pyScript.src = '/qol/assets/python/granny-square/main.py';

        document.body.appendChild(pyScript);

        return () => {
            document.removeEventListener('py-app-ready', handleAppReady);
            pyScript.remove();
            delete window.generateGrannySquare;
            delete window.addLogs;
        };
    }, []);

    const hasGridData = grannyGridState.colourGrid.length > 0 && grannyGridState.patternGrid.length > 0;

    useEffect(() => {
        if (!isLoading) {
            if (!hasGridData) {
                setIsOutputDisabled(true);
                setActiveTab('logs-tab');
            } else {
                setIsOutputDisabled(false);
                setActiveTab('output-tab');
            }
        }
    }, [hasGridData, isLoading]);

    const activeHighlight = hoveredColour ?? selectedColour;

    const handleColourClick = (colour: string) => {
        // Toggle active selection on click
        if (selectedColour?.toLowerCase() === colour.toLowerCase()) {
            setSelectedColour(null);
        } else {
            setSelectedColour(colour);
        }
    };

    const isPatternGridEmpty = isLoading || (Object.keys(filledCells).length === 0 && Object.keys(lockedCells).length === 0);
    const isPhone = !useMediaQuery(600); // Use the custom hook to determine if the device is a phone



    const tabItems: TabItem[] = [
        {
            id: 'output-tab',
            label: 'Grid & Palette',
            disabled: isOutputDisabled,
            content: (
                <div className="output-flex-wrapper">
                    <div id="grid-container">
                        <GrannyGrid
                            key={JSON.stringify(grannyGridState)} // Force re-render when state changes
                            gridSize={grannyGridState.gridSize}
                            colourGrid={grannyGridState.colourGrid}
                            patternGrid={grannyGridState.patternGrid}
                            highlightedColour={activeHighlight}
                            lockedCells={lockedCells}
                            handleCellLockToggle={handleCellLockToggle}
                        />
                    </div>
                    <div id="palette-table-container">
                        <PaletteDisplay
                            key={JSON.stringify(grannyGridState.palette)} // Force re-render when palette changes
                            palette={grannyGridState.palette}
                            activeColour={selectedColour}
                            onHoverColour={setHoveredColour}
                            onClickColour={handleColourClick}
                            clearLocks={handleClearLockedCells}
                            hasClearLocksButton={Object.keys(lockedCells).length > 0}
                        />
                    </div>
                </div>
            ),
        },
        {
            id: 'patterns-tab',
            label: 'Patterns',
            disabled: isPhone && isPatternGridEmpty,
            content: (
                <div className="output-section">
                    <div id="grid-container">
                        <InputGrid
                            filledCells={filledCells}
                            setFilledCells={setFilledCells}
                            gridSize={parseInt(gridSize, 10)}
                            maxInput={parseInt(numPatterns, 10)}
                            lockedCells={lockedCells}
                            handleClearGrid={handleClearGrid}
                            handleFillCell={handleFillCell}
                            handleClearFilled={handleClearFilled}
                            handleRemoveLocks={handleRemoveLocks}

                        />
                    </div>
                </div>
            ),
        },
        {
            id: 'logs-tab',
            label: 'Logs',
            content: (
                <div className="output-section">
                    <div id="log-container" className="card card-output-logs">
                        {generationLogs && generationLogs.length > 0 ? generationLogs.join('\n') : `Click Generate Square to begin`}
                    </div>
                </div>
            ),
        },
    ];


    return (
        <div className="app-wrapper">
            <div id="loading-spinner" className={`card ${isLoading ? '' : 'collapsed'}`}>
                <span>Loading Python environment and scripts...</span>
            </div>

            <ControlPanel
                gridSize={gridSize}
                setGridSize={setGridSize}
                numPatterns={numPatterns}
                setNumPatterns={setNumPatterns}
                filledCells={filledCells}
                setFilledCells={setFilledCells}
                isLoading={isLoading}
                setGenerationLogs={setGenerationLogs}
                setActiveTab={setActiveTab}
                setIsOutputDisabled={setIsOutputDisabled}
                setGrannyGridState={setGrannyGridState}
                lockFilledCells={lockFilledCells}
            />

            <Tabs tabs={tabItems} activeId={activeTab} onTabChange={(tabId) => setActiveTab(tabId)} />
        </div>
    );
}