import { logDb, type LogEntry } from '@/db/theLogsDb';
import { useLiveQuery } from 'dexie-react-hooks';
import { toast } from 'sonner'

export const useLogs = () => {
    const logs = useLiveQuery(
        () => logDb.logEntries.orderBy('createdAt').reverse().toArray(), [], []) ?? [];

    const addLog = async (content: string) => {
        if (!content.trim()) return;

        const log: LogEntry = {
            id: crypto.randomUUID(),
            content,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
        };

        try {
            await logDb.logEntries.add(log);
        } catch (error) {
            toast.error('Failed to add log');
        }
    };

    const updateLog = async (id: string, partialLog: Partial<Omit<LogEntry, 'id' | 'createdAt' | 'updatedAt'>>) => {
        try {
            await logDb.logEntries.update(id, {
                ...partialLog,
                updatedAt: new Date().toISOString(),
            });
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