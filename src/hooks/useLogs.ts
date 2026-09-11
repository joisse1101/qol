import { logDb, type LogEntry, LogEntrySchema } from '@/db/theLogsDb';
import { useLiveQuery } from 'dexie-react-hooks';
import { useMemo } from 'react';
import { toast } from 'sonner'

export const useLogs = () => {
    const rawLogs = useLiveQuery(
        () => logDb.logEntries.orderBy('createdAt').reverse().toArray(), [], []) ?? [];
    
    const logs = useMemo(() => {
        let lastSeenDateString = '';

        return rawLogs.map((log) => {
            const logDateString = new Date(log.createdAt).toISOString().split('T')[0];
            const isLastOfDay = logDateString !== lastSeenDateString;

            if (isLastOfDay) {
                lastSeenDateString = logDateString;
            }

            return {
                ...log,
                isLastOfDay,
            };
        });
    }, [rawLogs]);

    const addLog = async (content: string) => {
        if (!content.trim()) return;

        const log = LogEntrySchema.parse({
            content,
        });

        try {
            await logDb.logEntries.add(log);
        } catch (error) {
            toast.error('Failed to add log');
        }
    };

    const updateLog = async (id: string, partialLog: Partial<Omit<LogEntry, 'id' | 'createdAt' | 'updatedAt'>>) => {
        try {
            const log = LogEntrySchema.parse({
                ...partialLog,
                updatedAt: new Date().toISOString(),
            });
            await logDb.logEntries.update(id, log);
        } catch (error) {
            toast.error(`Failed to update log ${id}`);
        }
    };

    const removeLog = async (id: string) => {
        try {
            await logDb.logEntries.delete(id);
        } catch (error) {
            toast.error(`Failed to delete log ${id}`);
        }
    };

    return { logs, addLog, updateLog, removeLog };
};