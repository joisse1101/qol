import { ButtonSelector, DateInput } from '@joisse1101/ui-library';
import { Modal } from '@joisse1101/ui-library';
import React, { useState } from 'react';
import type { GoalTrackerState } from '@/hooks/useGoalTracker';
import { DayOptions } from '@/utils/dates';
import { RadioSelector } from '@joisse1101/ui-library';
import { toast } from 'sonner';

interface ConfigureGoalModalProps {
    isOpen: boolean;
    onClose: () => void;
    goalTrackerState: GoalTrackerState;
    updateGoalTrackerState: (updates: Partial<GoalTrackerState>) => void;
}

export const ConfigureGoalModal: React.FC<ConfigureGoalModalProps> = ({
    isOpen,
    onClose,
    goalTrackerState,
    updateGoalTrackerState
}) => {
    const [goalTitle, setGoalTitle] = useState<string>(goalTrackerState.goalTitle ?? '');
    const [startDate, setStartDate] = useState<string>(goalTrackerState.startDate.toISOString().split('T')[0]);
    const [endDate, setEndDate] = useState<string>(goalTrackerState.endDate.toISOString().split('T')[0]);
    const [expectedProgress, setExpectedProgress] = useState<number | ''>(goalTrackerState.expectedProgressPerDay);
    const [targets, setTargets] = useState<string>(goalTrackerState.goalTargets.join(','));
    const [selectedOverloadDays, setSelectedOverloadDays] = useState<(string | number)[]>(goalTrackerState.overloadDays);
    const [firstDayOfWeek, setFirstDayOfWeek] = useState<string | number>(goalTrackerState.firstDayOfWeek);
    const [units, setUnits] = useState<string>(goalTrackerState.units);

    const [errors, setErrors] = useState<string[]>([]);

    const handleDaySelect = (value: string | number) => {
        setSelectedOverloadDays((prev) => {
            if (prev.includes(value)) {
                return prev.filter((v) => v !== value);
            } else {
                return [...prev, value];
            }
        });
    };

    const handleValidateAndSubmit = () => {
        const newErrors: string[] = [];

        if (!startDate) newErrors.push('Start date is required.');
        if (!endDate) newErrors.push('End date is required.');
        if (startDate && endDate && new Date(startDate) > new Date(endDate)) {
            newErrors.push('Start date cannot be after end date.');
        }
        if (expectedProgress === '') newErrors.push('Expected progress per day is required.');
        if (!targets) {
            newErrors.push('Goal targets are required.')
        } else if (!/^\s*\d+(\s*,\s*\d+)*\s*$/.test(targets)) {
            newErrors.push('Goal targets must be a list of comma-separated numbers.');
        }
        if (selectedOverloadDays.length === 0) {
            newErrors.push('At least one overload day must be selected.');
        }
        if (firstDayOfWeek === undefined || firstDayOfWeek === '') {
            newErrors.push('First day of the week must be selected.');
        }


        if (newErrors.length > 0) {
            setErrors(newErrors);
            return;
        }

        const parsedTargets = targets
            .split(',')
            .map((item) => Number(item.trim()));

        updateGoalTrackerState(
            {
                goalTitle,
                expectedProgressPerDay: parseFloat(expectedProgress as string),
                startDate: new Date(startDate),
                endDate: new Date(endDate),
                goalTargets: parsedTargets,
                overloadDays: selectedOverloadDays.map((day) => Number(day)),
                firstDayOfWeek: firstDayOfWeek !== undefined ? Number(firstDayOfWeek) : 0,
                units: units
            }
        );
        onClose();
        setErrors([]);
        toast.success('Goal tracker configuration updated successfully.');
    };


    return (
        <Modal
            isOpen={isOpen}
            onSubmit={handleValidateAndSubmit}
            onClose={onClose}
            title={'Configure Goal'}
        >
            <div className='form-container'>
                <div className="form-group">
                    <label htmlFor="goal-title">Goal Name:</label>
                    <input type="text" id="goal-title" name="goal-title" placeholder="What is your goal?" value={goalTitle} onChange={(e) => setGoalTitle(e.target.value)} />
                </div>
                <div className='form-row'>
                    <DateInput label="Start Date:" id="start-date" name="start-date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
                    <DateInput label="End Date:" id="end-date" name="end-date" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
                </div>
                <div className="form-group">
                    <label htmlFor="expected-progress">Expected Progress Per Day:</label>
                    <div className="input-wrapper">
                        <input type="number" className="no-spinner" id="expected-progress" name="expected-progress" placeholder="e.g., 5" value={expectedProgress} onChange={(e) => setExpectedProgress(e.target.value === '' ? '' : Number(e.target.value))} />
                        <span className="input-suffix">km</span>
                    </div>
                </div>
                <div className="form-group">
                    <label htmlFor="targets">Goal Targets:</label>
                    <input type="text" id="targets" name="targets" placeholder="Enter a list of comma-separated numbers" value={targets} onChange={(e) => setTargets(e.target.value)} />
                </div>
                <ButtonSelector
                    label={'Select overload days:'}
                    options={DayOptions}
                    selectedOptions={selectedOverloadDays}
                    onSelect={handleDaySelect}
                    title={'Select days of the week that you want to set as overload days. These days will be used to make up for missed progress.'}
                />
                <RadioSelector
                    label={'Select first day of week:'}
                    options={DayOptions}
                    selectedOptions={firstDayOfWeek}
                    onSelect={setFirstDayOfWeek}
                />
                <div className="form-group">
                    <label htmlFor="units">Units:</label>
                    <input type="text" id="units" name="units" placeholder="e.g., km" value={units} onChange={(e) => setUnits(e.target.value)} />
                </div>
                {errors.length > 0 &&
                    <div className='error-messages'>
                        {errors.map((error, index) => (
                            <div key={index} className="error-message">{error}</div>
                        ))}
                    </div>
                }
            </div>
        </Modal>
    );
};