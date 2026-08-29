import { useEffect, useRef, useState } from "react";
import { useCanSideScroll } from '@joisse1101/ui-library';
import type { GoalState } from "@/hooks/useGoalTracker";
import { ConfigureGoalModal } from "./ConfigureGoalModal";
import type { GoalTrackerState } from "@/types/GoalTrackerState";

export const GoalTimeline: React.FC<{
    goals: GoalState[],
    goalTrackerState: GoalTrackerState,
    updateGoalTrackerState: (updates: Partial<GoalTrackerState>) => void;
    currentProgress: number;
}> = ({
    goals,
    goalTrackerState,
    updateGoalTrackerState,
    currentProgress,
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
                <div className="timeline-footer">
                    <span>{`Completed ${currentProgress.toFixed(2)}${goalTrackerState.units ? ` ${goalTrackerState.units}` : ''}`}</span>
                    <button type="button" className="btn btn-primary" onClick={() => setIsModalOpen(true)}>Configure Goal</button>
                </div>
                </div>
                <ConfigureGoalModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} goalTrackerState={goalTrackerState} updateGoalTrackerState={updateGoalTrackerState} />
            </>
        );
    };

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