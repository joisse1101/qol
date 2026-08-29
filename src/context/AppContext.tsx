import React, { createContext, useContext, useState, useEffect } from 'react';
import { type AppState } from '@/types/AppState';

const DEFAULT_STATE = { version: 1, updatedAt: '', tools: {} };

export const AppContext = createContext<{
    appState: AppState;
    setAppState: React.Dispatch<React.SetStateAction<AppState>>;
    updateToolState: (toolName: string, toolData: any, instanceId?: string) => void;
} | null>(null);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [appState, setAppState] = useState<AppState>(() => {
        const local = localStorage.getItem('app_root_state');
        return local ? JSON.parse(local) : DEFAULT_STATE;
    });

    // Save to localStorage on any state change
    useEffect(() => {
        localStorage.setItem('app_root_state', JSON.stringify(appState));
    }, [appState]);

    // Specific helper for individual mini-tools
    const updateToolState = (toolName: string, toolData: any, instanceId?: string) => {
        setAppState((prev: any) => ({
            ...prev,
            updatedAt: new Date().toISOString(),
            tools: {
                ...prev.tools,
                [toolName]: instanceId ? {
                    ...prev.tools[toolName],
                    [instanceId]: toolData
                } : toolData,
            },
        }));
        console.log('New appState after update:', {
            ...appState,
            updatedAt: new Date().toISOString(),
        })
    };

    return (
        <AppContext.Provider value={{ appState, setAppState, updateToolState }
        }>
            {children}
        </AppContext.Provider>
    );
};

export const useAppState = () => {
    const context = useContext(AppContext);
    if (!context) {
        throw new Error('useAppState must be used within an AppProvider');
    }
    const { appState, setAppState } = context;
    return { appState, setAppState };
};

function getToolRecord(tools: AppState['tools'], toolName: string): Record<string, any> {
    const tool = tools[toolName];
    if (typeof tool === 'object' && tool !== null) {
        return tool as Record<string, any>;
    }
    return {};
}

// Custom hook for mini-tools
export const useMiniTool = (toolName: string, instanceId?: string) => {
    const context = useContext(AppContext);
    if (!context) {
        throw new Error('useMiniTool must be used within an AppProvider');
    }
    const { appState, updateToolState } = context;
    const toolData = instanceId ? (getToolRecord(appState.tools, toolName)[instanceId] || {}) : (getToolRecord(appState.tools, toolName) || {});

    const setToolData = (data: any, instanceId?: string) => updateToolState(toolName, data, instanceId);

    return { toolData, setToolData };
};

export const useMiniToolInstanceIds = (toolName: string) => {
    const context = useContext(AppContext);
    if (!context) {
        throw new Error('useMiniToolInstanceIds must be used within an AppProvider');
    }
    const { appState, updateToolState } = context;
    const instanceIds: string[] = Object.keys(appState.tools[toolName] || {});
    const setInstanceIds: (ids: string[]) => void = (ids: string[]) => {
        const newInstances = ids.map(id => getToolRecord(appState.tools, toolName)[id] || {}).reduce((acc, curr, idx) => {
            acc[ids[idx]] = curr;
            return acc;
        }, {});
        updateToolState(toolName, newInstances);
    };
    return { instanceIds, setInstanceIds };
};