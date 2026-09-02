import Dexie, { type Table } from 'dexie';
import { z } from 'zod';

export const ToolInstanceSchema = z.object({
    id: z.string(),
    toolName: z.string(),
    updatedAt: z.string(),
    data: z.record(z.string(), z.any()),
});

export type ToolInstance = z.infer<typeof ToolInstanceSchema>;

export class AppDatabase extends Dexie {
    tools!: Table<ToolInstance, string>;

    constructor() {
        super('AppDatabase');
        this.version(1).stores({
            tools: 'id, toolName, updatedAt', // Indexes allow fast querying by toolName
        });
    }
}

export const db = new AppDatabase();