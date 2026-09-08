import Dexie, { type Table } from 'dexie';
import { z } from 'zod';

export const LogEntrySchema = z.object({
    id: z.string(),
    content: z.string(),
    createdAt: z.string(),
    updatedAt: z.string(),
});

export type LogEntry = z.infer<typeof LogEntrySchema>;

export class LogDatabase extends Dexie {
    logEntries!: Table<LogEntry, string>;

    constructor() {
        super('AppDatabase');
        this.version(1).stores({
            logEntries: 'id, createdAt, updatedAt, type',
        });
    }
}

export const logDb = new LogDatabase();