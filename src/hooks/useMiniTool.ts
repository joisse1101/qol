import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '@/db/appDb';

// Hook for fetching all instance IDs belonging to a mini-tool
export const useMiniToolInstanceIds = (toolName: string) => {
    const records = useLiveQuery(
        () => db.tools.where('toolName').equals(toolName).toArray(),
        [toolName]
    );

    const instanceIds = records ? records.map((r) => r.id.split(':')[1]) : [];

    const createDefaultInstance = async (instanceId: string, initialData: any = {}) => {
        await db.tools.put({
            id: `${toolName}:${instanceId}`,
            toolName,
            updatedAt: new Date(0).toISOString(),
            data: initialData,
        });
    };

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

        await db.tools.put({
            id: '_meta:sync',
            toolName: '_meta',
            updatedAt: new Date().toISOString(),
            data: {},
        });
    };

    return {
        instanceIds,
        createDefaultInstance,
        createInstance,
        deleteInstance,
        isLoading: records === undefined,
    };
};

// Hook for accessing a single mini-tool instance's data
export const useMiniTool = (toolName: string, instanceId: string = 'default') => {
    const id = `${toolName}:${instanceId}`;

    const record = useLiveQuery(() => db.tools.get(id), [id]);

    // Supports passing either an object OR a updater function: setToolData((prev) => ({ ...prev, key: val }))
    const setToolData = async (updatedDataOrFn: any) => {
        await db.transaction('rw', db.tools, async () => {
            const currentRecord = await db.tools.get(id);
            const prevData = currentRecord?.data || {};

            const nextData = typeof updatedDataOrFn === 'function'
                ? updatedDataOrFn(prevData)
                : updatedDataOrFn;

            await db.tools.put({
                id,
                toolName,
                data: nextData,
                updatedAt: new Date().toISOString(),
            });
        });
    };

    return {
        toolData: record?.data || {},
        setToolData,
        isLoading: record === undefined,
    };
};