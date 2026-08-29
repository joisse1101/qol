import { z } from 'zod';
import { GoalTrackerStateSchema } from './GoalTrackerState';
import { generateUUID } from '@/utils/numbers';
import { defaultGoalTrackerState } from '@/hooks/useGoalTracker';

export const AppStateSchema = z.object({
    version: z.number(),
    updatedAt: z.string(),
    tools: z
        .object({
            goalTracker: z
                .record(
                    z.string(),
                    z.object({
                        trackerState: GoalTrackerStateSchema,
                        progressOnDates: z.record(z.string(), z.string()),
                        currentWeek: z.number(),
                    })
                )
                .optional(), // Works if undefined, but validates structure if present
        })
        .catchall(z.unknown()), // Allows extra unlisted tool keys
});

export type AppState = z.infer<typeof AppStateSchema>;

export const defaultAppState: AppState = {
    version: 1,
    updatedAt: new Date().toISOString(),
    tools: {
        goalTracker: {
            [generateUUID()]: {
                trackerState: defaultGoalTrackerState,
                progressOnDates: {},
                currentWeek: 1,
            }
        },
    },
};