import { GistSyncService } from '@/services/gistService';
import { useState, useCallback } from 'react';
import { db, type ToolInstance } from '@/db/db';
import { toast } from 'sonner';

export type FlatGistPayload = {
    version: number;
    updatedAt: string;
    tools: ToolInstance[];
};

export const useGistSync = (token: string) => {

    // Dynamically calculate the latest modification date across all local records
    const exportDbState = useCallback(async (): Promise<FlatGistPayload> => {
        const records = await db.tools.toArray();

        let latestTime = 0;
        const exportableTools: ToolInstance[] = [];

        records.forEach((record) => {
            console.log('Processing record:', record, record.updatedAt);
            if (record.updatedAt) {
                const recTime = new Date(record.updatedAt).getTime();
                if (recTime > latestTime) {
                    latestTime = recTime;
                }
            }
            // Exclude internal metadata records from the exported payload array
            if (!record.id.startsWith('_meta:')) {
                exportableTools.push(record);
            }
        });

        const computedUpdatedAt = latestTime > 0
            ? new Date(latestTime).toISOString()
            : new Date(0).toISOString();

        return {
            version: 1,
            updatedAt: computedUpdatedAt,
            tools: exportableTools,
        };
    }, []);

    // Check if local data is strictly newer than Gist remote data
    const getSyncStatus = useCallback(async (): Promise<'local' | 'remote' |'synced'> => {
        if (!token) return 'local';
        const remoteData = await new GistSyncService(token).loadData();
        if (!remoteData || !remoteData.updatedAt) return 'local';

        const localData = await exportDbState();

        const localTime = new Date(localData.updatedAt).getTime();
        const remoteTime = new Date(remoteData.updatedAt).getTime();

        console.log(remoteData);

        console.log(remoteTime, localTime);
        if (localTime > remoteTime) return 'local';
        if (localTime < remoteTime) return 'remote';
        return 'synced';
    }, [token, exportDbState]);

    // Import payload directly into Dexie
    const importDbState = useCallback(async (remoteData: FlatGistPayload) => {
        if (!Array.isArray(remoteData?.tools)) return;

        await db.transaction('rw', db.tools, async () => {
            await db.tools.clear();
            await db.tools.bulkPut(remoteData.tools);

            if (remoteData.updatedAt) {
                await db.tools.put({
                    id: '_meta:sync',
                    toolName: '_meta',
                    updatedAt: remoteData.updatedAt,
                    data: {},
                });
            }
        });
    }, []);

    const handleSave = useCallback(async () => {
        if (!token) return;
        try {
            const payload = await exportDbState();

            // Override overall payload timestamp to current time on export
            payload.updatedAt = new Date().toISOString();

            const service = new GistSyncService(token);
            await service.saveData(payload);
            toast.success('Saved to GitHub Gist successfully!');
        } catch (err) {
            toast.error('Failed to save to GitHub Gist.');
            console.error(err);
        }
    }, [token, exportDbState]);

    const handleLoad = useCallback(async () => {
        if (!token) return;
        try {
            const service = new GistSyncService(token);
            const data = await service.loadData();
            if (data?.tools && Array.isArray(data.tools)) {
                await importDbState(data);
                toast.success('Loaded from GitHub Gist successfully!');
            } else {
                toast.error('No saved data found on GitHub Gist.');
            }
        } catch (err) {
            toast.error('Failed to load from GitHub Gist.');
            console.error(err);
        }
    }, [token, importDbState]);

    return { handleSave, handleLoad, getSyncStatus };
};