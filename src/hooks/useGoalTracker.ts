import { useEffect, useState, useMemo, useCallback } from "react";
import { getDatesInRange, getDaysBetween, getLocalDateKey, getMostRecentFirstDay, parseDate } from "@/utils/dates";
import { getStatusColor, interpolateColors } from "@/utils/colours";
import { downloadJson, uploadJson } from "@/utils/json";
import { showUploadDownloadToast } from "@/constants/toastConstants";
import { useMiniTool } from "@/context/AppContext";
import type { GoalTrackerState } from "@/types/GoalTrackerState";

// --- Types ---

export type GoalStatus = 'PENDING' | 'ACTIVE' | 'COMPLETED';
export type GoalType = 'normal' | 'stretch';

export type GoalState = {
    number: number;
    title: string;
    subtitle: string;
    color: string;
    state: GoalStatus;
    type: GoalType;
};

type JsonState = GoalTrackerState & {
    currentWeek: number;
    progressOnDates: Record<string, string>;
};


function handleFileUpload(file: File,
    updateGoalTrackerState: (updates: Partial<GoalTrackerState>) => void,
    setCurrWeek: (week: number) => void,
    setProgressOnDates: (progress: Record<string, string>) => void) {
    const data = uploadJson<JsonState>(file);
    data.then((parsedData) => {
        updateGoalTrackerState(parseGoalStateFromJson(parsedData));
        const nextWeek = Number(parsedData.currentWeek);
        setCurrWeek(Number.isFinite(nextWeek) ? nextWeek : 1);
        setProgressOnDates(parsedData.progressOnDates ?? {});
        showUploadDownloadToast('upload', true);
    }).catch((error) => {
        console.error('Failed to upload goal tracker data:', error);
        showUploadDownloadToast('upload', false);
    });
}

function handleFileDownload(goalTrackerState: GoalTrackerState, currentWeek: number, progressOnDates: Record<string, string>) {
    try {
        const downloadState: JsonState = {
            ...goalTrackerState,
            currentWeek,
            progressOnDates,
        };
        downloadJson(downloadState, `${goalTrackerState.goalTitle.replace(/\s+/g, '_')}_goal_tracker.json`);
        showUploadDownloadToast('download', true);
    } catch (error: unknown) {
        console.error('Failed to download goal tracker data:', error);
        showUploadDownloadToast('download', false);
    }
}

export const defaultGoalTrackerState: GoalTrackerState = {
    goalTitle: 'Your Goal',
    startDate: new Date(Date.now()),
    endDate: new Date(Date.now() + 6 * 24 * 60 * 60 * 1000),
    expectedProgressPerDay: 5,
    goalTargets: [1, 5, 30, 100, 200, 300, 500, 750],
    overloadDays: [0, 6],
    firstDayOfWeek: 0,
    units: 'km',
};

function parseGoalStateFromJson(json: any): GoalTrackerState {
    const isNumber = (val: any) => typeof val === 'number' && !isNaN(val);

    return {
        goalTitle: json?.goalTitle != null ? String(json.goalTitle) : defaultGoalTrackerState.goalTitle,

        startDate: parseDate(json?.startDate, defaultGoalTrackerState.startDate),
        endDate: parseDate(json?.endDate, defaultGoalTrackerState.endDate),

        expectedProgressPerDay: isNumber(Number(json?.expectedProgressPerDay))
            ? Number(json.expectedProgressPerDay)
            : defaultGoalTrackerState.expectedProgressPerDay,

        goalTargets: Array.isArray(json?.goalTargets)
            ? json.goalTargets.map(Number).filter((n: number) => !isNaN(n))
            : defaultGoalTrackerState.goalTargets ?? [],

        overloadDays: Array.isArray(json?.overloadDays)
            ? json.overloadDays.map(Number).filter((n: number) => !isNaN(n))
            : defaultGoalTrackerState.overloadDays ?? [],

        firstDayOfWeek: isNumber(parseInt(json?.firstDayOfWeek, 10))
            ? parseInt(json.firstDayOfWeek, 10)
            : defaultGoalTrackerState.firstDayOfWeek,

        units: json?.units != null ? String(json.units) : '',
    };
}

// --- Hooks ---
export const useGoalTracker = (id: string) => {
    const { toolData, setToolData } = useMiniTool('goalTracker', id);

    // --- State Initialization ---
    const [goalTrackerState, setGoalTrackerState] = useState<GoalTrackerState>(parseGoalStateFromJson(toolData.trackerState));
    const [progressOnDates, setProgressOnDates] = useState<Record<string, string>>(toolData.progressOnDates || {});
    const [currWeek, setCurrWeek] = useState<number>(toolData.currentWeek || 1);

    // --- Persistence Side Effects ---
    useEffect(() => {
        setToolData({
            trackerState: goalTrackerState,
            currentWeek: currWeek,
            progressOnDates: progressOnDates,
        }, id);
    }, [goalTrackerState, currWeek, progressOnDates]);

    // --- Date Computations ---
    const firstDayOfTracker = getMostRecentFirstDay(goalTrackerState.startDate, goalTrackerState.firstDayOfWeek);

    const daysInTracker = getDaysBetween(goalTrackerState.startDate, goalTrackerState.endDate) + 1;
    const weeksInTracker = Math.max(1, Math.ceil((getDaysBetween(firstDayOfTracker, goalTrackerState.endDate) + 1) / 7));

    // Ensure currWeek remains strictly bound to allowable ranges
    useEffect(() => {
        if (currWeek > weeksInTracker) setCurrWeek(weeksInTracker);
        if (currWeek < 1) setCurrWeek(1);
    }, [weeksInTracker, currWeek]);

    const currWeekState = useMemo(() => {
        const startMs = firstDayOfTracker.getTime() + (currWeek - 1) * 7 * 24 * 60 * 60 * 1000;
        return {
            startDate: new Date(startMs),
            endDate: new Date(startMs + 6 * 24 * 60 * 60 * 1000),
            week: currWeek,
        };
    }, [firstDayOfTracker, currWeek]);

    const datesInWeek = useMemo(() =>
        getDatesInRange(currWeekState.startDate, currWeekState.endDate),
        [currWeekState]
    );

    // --- Helpers for Date Checking ---
    const getProgressForDate = useCallback((date: Date): string => {
        return progressOnDates[getLocalDateKey(date)] || '';
    }, [progressOnDates]);

    const hasProgressForDate = useCallback((date: Date): boolean => {
        const progress = Number(progressOnDates[getLocalDateKey(date)]);
        return !!progress && !isNaN(progress) && progress > 0;
    }, [progressOnDates]);

    // --- Progress & Overload Calculations ---
    const { overloadDatesLeft, nonOverloadDatesLeft } = useMemo(() => {
        const trackerDates = getDatesInRange(goalTrackerState.startDate, goalTrackerState.endDate);
        return {
            overloadDatesLeft: trackerDates.filter((date) => goalTrackerState.overloadDays.includes(date.getDay()) && !hasProgressForDate(date)),
            nonOverloadDatesLeft: trackerDates.filter((date) => !goalTrackerState.overloadDays.includes(date.getDay()) && !hasProgressForDate(date))
        };
    }, [goalTrackerState.startDate, goalTrackerState.endDate, goalTrackerState.overloadDays, hasProgressForDate]);

    const currentProgress = useMemo(() => {
        const startDateKey = getLocalDateKey(goalTrackerState.startDate);
        const endDateKey = getLocalDateKey(goalTrackerState.endDate);

        return Object.entries(progressOnDates).reduce((sum, [dateKey, progress]) => {
            const isTracked = dateKey >= startDateKey && dateKey <= endDateKey;
            return isTracked ? sum + (parseFloat(progress) || 0) : sum;
        }, 0);
    }, [progressOnDates, goalTrackerState.startDate, goalTrackerState.endDate]);

    const targetOverloadProgress = useMemo(() => {
        const maxTarget = goalTrackerState.goalTargets[goalTrackerState.goalTargets.length - 1] || 0;
        const progressLeft = maxTarget - currentProgress;

        if (overloadDatesLeft.length === 0 || progressLeft <= 0) {
            return goalTrackerState.expectedProgressPerDay;
        }

        const overloadTarget = (progressLeft - nonOverloadDatesLeft.length * goalTrackerState.expectedProgressPerDay) / overloadDatesLeft.length;
        return parseFloat((overloadTarget < goalTrackerState.expectedProgressPerDay ? goalTrackerState.expectedProgressPerDay : overloadTarget).toFixed(2));
    }, [goalTrackerState.goalTargets, goalTrackerState.expectedProgressPerDay, currentProgress, overloadDatesLeft.length, nonOverloadDatesLeft.length]);

    // --- Goals State Computation ---
    const goals: GoalState[] = useMemo(() => {
        const goalTargets = goalTrackerState.goalTargets;
        const expectedTotalProgress = goalTrackerState.expectedProgressPerDay * daysInTracker;
        const goalType = goalTargets.map((num) => num <= goalTrackerState.expectedProgressPerDay * daysInTracker ? 'normal' : 'stretch');
        const numNormalGoals = goalTargets.filter((num) => num <= goalTrackerState.expectedProgressPerDay * daysInTracker).length;

        const goalColors = [
            ...interpolateColors(getStatusColor('danger'), getStatusColor('warning'), Math.max(0, Math.floor(numNormalGoals / 2) - 2)),
            ...interpolateColors(getStatusColor('warning'), getStatusColor('success'), Math.max(0, numNormalGoals - Math.floor(numNormalGoals / 2) - 1)).slice(1),
            ...interpolateColors(getStatusColor('success'), getStatusColor('stretch'), Math.max(0, goalTargets.length - numNormalGoals - 1)).slice(1)
        ];

        const activeGoalIdx = goalTargets.findIndex((goal) => goal > currentProgress);

        return goalTargets.map((number, idx) => ({
            number,
            title: `${number} ${goalTrackerState.units}`,
            subtitle: `${(number / expectedTotalProgress * 100).toFixed(0)}% of target`,
            color: goalColors[idx],
            state: activeGoalIdx === -1 ? 'COMPLETED' : idx === activeGoalIdx ? 'ACTIVE' : idx < activeGoalIdx ? 'COMPLETED' : 'PENDING',
            type: goalType[idx]
        }));
    }, [goalTrackerState.goalTargets, goalTrackerState.expectedProgressPerDay, goalTrackerState.units, daysInTracker, currentProgress]);

    // --- State Updaters ---
    const incrementWeek = useCallback((increment: number) => {
        setCurrWeek((prev) => {
            const nextWeek = prev + increment;
            if (nextWeek < 1 || nextWeek > weeksInTracker) return prev;
            return nextWeek;
        });
    }, [weeksInTracker]);

    const setProgressForDate = useCallback((date: Date, progress: string) => {
        const dateKey = getLocalDateKey(date);
        setProgressOnDates((prev) => {
            const updated = { ...prev };
            if (progress === '') {
                delete updated[dateKey];
            } else {
                updated[dateKey] = progress;
            }
            return updated;
        });
    }, []);

    const updateGoalTitle = useCallback((title: string) => {
        const newTitle = title || 'Your Goal';
        setGoalTrackerState((prev) => ({ ...prev, goalTitle: newTitle }));
        window.dispatchEvent(
            new CustomEvent('goal_title_changed', {
                detail: { id, title: newTitle },
            })
        );
    }, [id]);

    const updateGoalTrackerState = useCallback((updates: Partial<GoalTrackerState>) => {
        setGoalTrackerState((prev) => {
            const nextState = { ...prev, ...updates };

            if (updates.goalTargets) {
                nextState.goalTargets = [...updates.goalTargets].sort((a, b) => a - b);
            }
            return nextState;
        });

        if (updates.goalTitle !== undefined) {
            window.dispatchEvent(
                new CustomEvent('goal_title_changed', {
                    detail: { id, title: updates.goalTitle || 'Your Goal' },
                })
            );
        }
    }, [id]);

    // -- Upload and Download Functions ---
    const onUpload = (file: File) => handleFileUpload(file, updateGoalTrackerState, setCurrWeek, setProgressOnDates);
    const onDownload = () => handleFileDownload(goalTrackerState, currWeek, progressOnDates);

    return {
        currWeekState,
        incrementWeek,
        weeksInTracker,
        datesInWeek,
        goals,
        getProgressForDate,
        setProgressForDate,
        goalTrackerState,
        updateGoalTrackerState,
        overloadDatesLeft,
        targetOverloadProgress,
        updateGoalTitle,
        onUpload: onUpload,
        onDownload: onDownload,
        currentProgress
    };
};