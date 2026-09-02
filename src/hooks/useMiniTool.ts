import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '@/db/db';

// Hook for fetching all instance IDs belonging to a mini-tool
export const useMiniToolInstanceIds = (toolName: string) => {
    // Query all records matching the toolName index
    const records = useLiveQuery(
        () => db.tools.where('toolName').equals(toolName).toArray(),
        [toolName]
    );

    const instanceIds = records ? records.map((r) => r.id.split(':')[1]) : [];

    const createInstance = async (instanceId: string, initialData: any = {}) => {
        await db.tools.put({
            id: `${toolName}:${instanceId}`,
            toolName,
            updatedAt: new Date().toISOString(),
            data: initialData,
        });
    };

    const deleteInstance = async (instanceId: string) => {
        await db.tools.delete(`${toolName}:${instanceId}`);
    };

    return {
        instanceIds,
        createInstance,
        deleteInstance,
        isLoading: records === undefined,
    };
};

// Hook for accessing a single mini-tool instance's data
export const useMiniTool = (toolName: string, instanceId: string = 'default') => {
    const id = `${toolName}:${instanceId}`;

    const record = useLiveQuery(() => db.tools.get(id), [id]);

    const setToolData = async (data: any) => {
        await db.tools.put({
            id,
            toolName,
            updatedAt: new Date().toISOString(),
            data,
        });
    };

    return {
        toolData: record?.data || {},
        setToolData,
        isLoading: record === undefined,
    };
};