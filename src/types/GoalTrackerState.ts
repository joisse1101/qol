import { z } from 'zod';

export const GoalTrackerStateSchema = z.object({
    goalTitle: z.string(),
    startDate: z.coerce.date(),
    endDate: z.coerce.date(),
    expectedProgressPerDay: z.number(),
    goalTargets: z.array(z.number()),
    overloadDays: z.array(z.number()),
    firstDayOfWeek: z.number(),
    units: z.string(),
});

export type GoalTrackerState = z.infer<typeof GoalTrackerStateSchema>;