import { CLEAR_LOCKED_CELLS_TOOLTIP } from '@/constants/grannySquareTooltips';
import React, { useState } from 'react';

export interface PaletteDisplayProps {
    palette: string[];
    activeColour: string | null;
    onHoverColour: (colour: string | null) => void;
    onClickColour: (colour: string) => void;
    clearLocks: () => void;
    hasClearLocksButton: boolean;
}

export const PaletteDisplay: React.FC<PaletteDisplayProps> = ({
    palette,
    activeColour,
    onHoverColour,
    onClickColour,
    clearLocks,
    hasClearLocksButton,
}) => {
    const [animatedRows, setAnimatedRows] = useState<Record<number, boolean>>({});

    const handleAnimationEnd = (idx: number) => {
        setAnimatedRows((prev) => ({ ...prev, [idx]: true }));
    };

    return (
        <>
            <div className="stacked">
                <button className="btn btn-danger" onClick={clearLocks} disabled={!hasClearLocksButton} title={CLEAR_LOCKED_CELLS_TOOLTIP}>
                    Clear Locks
                </button>
                <div className="palette-container">
                    {palette.map((colour, idx) => {
                        const isAnimationDone = animatedRows[idx];
                        const isActive = activeColour?.toLowerCase() === colour.toLowerCase();

                        const delay = idx * 0.05;
                        const rowStyle: React.CSSProperties = !isAnimationDone
                            ? ({ '--delay': `${delay.toFixed(2)}s` } as React.CSSProperties)
                            : {};

                        const swatchStyle = {
                            '--swatch-color': colour,
                        } as React.CSSProperties;

                        const classNames = [
                            'palette-row',
                            !isAnimationDone ? 'animated-cell' : '',
                            isActive ? 'is-active' : '',
                        ]
                            .filter(Boolean)
                            .join(' ');

                        return (
                            <div
                                key={`${colour}-${idx}`}
                                className={classNames}
                                style={rowStyle}
                                data-colour={colour.toLowerCase()}
                                onMouseEnter={() => onHoverColour(colour)}
                                onMouseLeave={() => onHoverColour(null)}
                                onClick={() => onClickColour(colour)}
                                onAnimationEnd={() => handleAnimationEnd(idx)}
                            >
                                <div className="palette-swatch" style={swatchStyle} />
                                <span className="palette-label">{colour}</span>
                            </div>
                        );
                    })}
                </div>
            </div>
        </>
    );
};