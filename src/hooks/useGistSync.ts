import { GistSyncService } from '@/services/gistService';
import { useState } from 'react';
import { useAppState } from '@/context/AppContext';

export const useGistSync = (token: string) => { 
    // const [isConnected, setIsConnected] = useState<boolean>(false);
    const [syncStatus, setSyncStatus] = useState<string>('');

    const {appState, setAppState} = useAppState();

    // const handleConnect = async () => {
    //         if (!token) return;
    //         setSyncStatus('Verifying token...');
    //         const service = new GistSyncService(token);
    //         const isValid = await service.verifyToken();
    
    //         if (isValid) {
    //             localStorage.setItem('github_oauth_token', token);
    //             setIsConnected(true);
    //             setSyncStatus('Connected to GitHub!');
    //         } else {
    //             setSyncStatus('Invalid token. Check scope permissions.');
    //         }
    //     };
    
        // Sync Data to Gist
    const handleSave = async () => {
            if (!token) return;
            setSyncStatus('Saving to GitHub Gist...');
            try {
                const service = new GistSyncService(token);
                await service.saveData(appState);
                setSyncStatus('Saved successfully!');
            } catch (err) {
                setSyncStatus('Save failed.');
                console.error(err);
            }
        };
    
        // Load Data from Gist
        const handleLoad = async () => {
            setSyncStatus('Loading from GitHub Gist...');
            try {
                const service = new GistSyncService(token);
                const data = await service.loadData();
                if (data && typeof data === 'object') {
                    setAppState(data);
                    setSyncStatus('Loaded successfully!');
                } else {
                    setSyncStatus('No saved data found.');
                }
            } catch (err) {
                setSyncStatus('Load failed.');
                console.error(err);
            }
    };
    
    const handleSync = async () => {
        const service = new GistSyncService(token);
        const data = await service.loadData();

        if (!data || data?.version < appState.version) {
            await handleSave();
            setSyncStatus('Local state saved to Gist.');
        } else if (data && data?.version > appState.version) {
            setAppState(data);
            setSyncStatus('Local state updated from Gist.');
        }
    };

    return { syncStatus, handleSave, handleLoad, handleSync };
};