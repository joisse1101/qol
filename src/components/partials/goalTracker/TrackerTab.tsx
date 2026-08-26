import { WeekSelector } from "@joisse1101/ui-library";
import { GoalTimeline } from "@/components/partials/goalTracker/GoalTimeline";
import { useGoalTracker } from "@/hooks/useGoalTracker";
import { isAfter, isBefore } from "@/utils/dates";

export const TrackerTab: React.FC<{ id: string }> = ({
    id,
}) => {

    const { currWeekState, incrementWeek, weeksInTracker, datesInWeek, goals, getProgressForDate, setProgressForDate, goalTrackerState, updateGoalTrackerState, overloadDatesLeft, targetOverloadProgress, onUpload, onDownload } = useGoalTracker(id);

    return (
        <div className="output-flex-wrapper stacked">
            <GoalTimeline goals={goals} goalTrackerState={goalTrackerState} updateGoalTrackerState={updateGoalTrackerState} onUpload={onUpload} onDownload={onDownload} />
            <WeekSelector
                weekState={currWeekState}
                incrementWeek={incrementWeek}
                maxWeeks={weeksInTracker}
            />
            <div className="stacked">
                {datesInWeek.map((date) => {
                    const placeholder = overloadDatesLeft.some(
                        (d) => d.toDateString() === date.toDateString()
                    ) ? targetOverloadProgress.toString() : goalTrackerState.expectedProgressPerDay.toString();
                    const isDisabled = isBefore(date, goalTrackerState.startDate) || isAfter(date, goalTrackerState.endDate);

                    return (
                        <div key={`${date.toISOString()}-${goalTrackerState.startDate.toISOString()}-${goalTrackerState.endDate.toISOString()}`} className="input-wrapper side-by-side">
                            <span style={{ width: '150px', display: 'inline-block' }}>
                                {date.toDateString()}
                            </span>
                            <input
                                type="number"
                                step="any"
                                className="no-spinner"
                                min="0"
                                placeholder={isDisabled ? '-' : placeholder}
                                disabled={isDisabled}
                                value={getProgressForDate(date)}
                                onChange={(e) => setProgressForDate(date, e.target.value)} />
                            {goalTrackerState.units && <span className="input-suffix">{goalTrackerState.units}</span>}
                        </div>
                    )
                })}
            </div>
        </div>
    )

}