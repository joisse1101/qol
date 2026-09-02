import { GistSyncService } from '@/services/gistService';
import { useState } from 'react';
import { db, type ToolInstance } from '@/db/db';

export type FlatGistPayload = {
    version: number;
    updatedAt: string;
    tools: ToolInstance[];
};

export const useGistSync = (token: string) => {
    const [syncStatus, setSyncStatus] = useState<string>('');

    // Export Dexie table directly as a flat array
    const exportDbState = async (): Promise<FlatGistPayload> => {
        const records = await db.tools.toArray();
        return {
            version: 1,
            updatedAt: new Date().toISOString(),
            tools: records,
        };
    };

    // Import flat array directly into Dexie
    const importDbState = async (remoteData: FlatGistPayload) => {
        if (!Array.isArray(remoteData?.tools)) return;

        await db.transaction('rw', db.tools, async () => {
            await db.tools.clear();
            await db.tools.bulkPut(remoteData.tools);
        });
    };

    const handleSave = async () => {
        if (!token) return;
        setSyncStatus('Saving to GitHub Gist...');
        try {
            const payload = await exportDbState();
            const service = new GistSyncService(token);
            await service.saveData(payload);
            setSyncStatus('Saved successfully!');
        } catch (err) {
            setSyncStatus('Save failed.');
            console.error(err);
        }
    };

    const handleLoad = async () => {
        if (!token) return;
        setSyncStatus('Loading from GitHub Gist...');
        try {
            const service = new GistSyncService(token);
            const data = await service.loadData();
            if (data?.tools && Array.isArray(data.tools)) {
                await importDbState(data);
                setSyncStatus('Loaded successfully!');
            } else {
                setSyncStatus('No saved data found.');
            }
        } catch (err) {
            setSyncStatus('Load failed.');
            console.error(err);
        }
    };

    return { syncStatus, handleSave, handleLoad };
};