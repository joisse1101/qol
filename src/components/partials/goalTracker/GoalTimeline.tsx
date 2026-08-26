import { useEffect, useRef, useState } from "react";
import { useCanSideScroll } from '@joisse1101/ui-library';
import type { GoalState } from "@/hooks/useGoalTracker";
import { ConfigureGoalModal } from "./ConfigureGoalModal";
import type { GoalTrackerState } from '@/hooks/useGoalTracker';

export const GoalTimeline: React.FC<{
    goals: GoalState[],
    goalTrackerState: GoalTrackerState,
    updateGoalTrackerState: (updates: Partial<GoalTrackerState>) => void;
    onUpload: (file: File) => void;
    onDownload: () => void;
}> = ({
    goals,
    goalTrackerState,
    updateGoalTrackerState,
    onUpload,
    onDownload
}) => {
        const [isModalOpen, setIsModalOpen] = useState(false);
        const containerRef = useRef<HTMLDivElement | null>(null);
        const { canScrollLeft, canScrollRight } = useCanSideScroll(containerRef);

    return (
        <>
            <div className="card">
                <div className='overlay-wrapper'>
                    <div className={`overlay-left ${!canScrollLeft ? 'hidden' : ''}`} />
                    <div className={`overlay-right ${!canScrollRight ? 'hidden' : ''}`} />
                    <div className={`horizontal-tracker overlay-component`} ref={containerRef}>
                        {goals.map((goal, idx) => {
                            return (
                                <GoalComponent
                                    key={idx}
                                    goal={goal}
                                />
                            );
                        })}
                    </div>
                </div>
                    <GoalButtons setIsModalOpen={setIsModalOpen} onUpload={onUpload} onDownload={onDownload} />
                </div>
                <ConfigureGoalModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} goalTrackerState={goalTrackerState} updateGoalTrackerState={updateGoalTrackerState} />
            </>
        );
    };

const GoalButtons: React.FC<{
    setIsModalOpen: React.Dispatch<React.SetStateAction<boolean>>;
    onUpload: (file: File) => void;
    onDownload: () => void;
}> = ({ setIsModalOpen, onUpload, onDownload }) => {
    const fileInputRef = useRef<HTMLInputElement>(null);
    const handleUploadButtonClick = () => {
        fileInputRef.current?.click();
    };

    const onFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        onUpload(file);
        event.target.value = '';
    };


    return (
        <div className="btn-container">
            <div className="btn-wrapper">
                <input
                    type="file"
                    ref={fileInputRef}
                    accept=".json,application/json"
                    onChange={onFileUpload}
                    style={{ display: 'none' }}
                />
                <button type="button" aria-label="Upload goal tracker JSON" className="btn btn-ghost" onClick={handleUploadButtonClick}>
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M14 10v2.5a1.5 1.5 0 0 1-1.5 1.5h-9A1.5 1.5 0 0 1 2 12.5V10"></path>
                        <polyline points="11 5 8 2 5 5"></polyline>
                        <line x1="8" y1="2" x2="8" y2="10"></line>
                    </svg>
                </button>
                <button type="button" aria-label="Download goal tracker JSON" className="btn btn-ghost" onClick={onDownload}>
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M14 10v2.5a1.5 1.5 0 0 1-1.5 1.5h-9A1.5 1.5 0 0 1 2 12.5V10"></path>
                        <polyline points="5 7 8 10 11 7"></polyline>
                        <line x1="8" y1="10" x2="8" y2="2"></line>
                    </svg>
                </button>
            </div>
            <button type="button" className="btn btn-primary" onClick={() => setIsModalOpen(true)}>Configure Goal</button>
        </div>
    )
}

const GoalComponent: React.FC<{
    goal: GoalState
}> = ({ goal }) => {
    const [isHovered, setIsHovered] = useState(false);
    const stepClass = goal.state === 'COMPLETED' ? 'completed' : goal.state === 'ACTIVE' ? 'active' : '';

    const baseBorderColor = goal.state === 'PENDING' ? 'var(--border-color)' : goal.color;
    const hoverBorderColor = `color-mix(in srgb, ${goal.color} 60%, white)`;

    useEffect(() => {
        if (goal.state === 'ACTIVE') {
            const activeElement = document.querySelector('.step.active');
            if (activeElement) {
                activeElement.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
            }
        }
    }, [goal.state]);
    return (
        <div className={`step ${stepClass}`}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
        >
            <div className="node"
                style={{
                    backgroundColor: goal.state === 'PENDING' ? 'var(--input-bg)' : `color-mix(in srgb, ${goal.color} 40%, transparent)`,
                    borderColor: isHovered ? hoverBorderColor : baseBorderColor
                }}
            >{goal.state === 'COMPLETED' ? '✔' :
                goal.number}</div>
            <div className="label-group">
                <span className="step-title">{goal.title}</span>
                <span className="step-subtitle">{goal.subtitle}</span>
            </div>

        </div>
    )
}