import React, { createContext, useContext, useState, useEffect } from 'react';

const DEFAULT_STATE = { version: 1, updatedAt: '', tools: {} };

export const AppContext = createContext<any>(null);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [appState, setAppState] = useState(() => {
        const local = localStorage.getItem('app_root_state');
        return local ? JSON.parse(local) : DEFAULT_STATE;
    });

    // Save to localStorage on any state change
    useEffect(() => {
        localStorage.setItem('app_root_state', JSON.stringify(appState));
    }, [appState]);

    // Specific helper for individual mini-tools
    const updateToolState = (toolName: string, toolData: any, instanceId?: string) => {
        console.log(`Updating state for tool: ${toolName}, instanceId: ${instanceId}`, toolData);

        console.log('Current appState before update:', appState);

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

// Custom hook for mini-tools
export const useMiniTool = (toolName: string, instanceId?: string) => {
    const { appState, updateToolState } = useContext(AppContext);
    const toolData = instanceId ? (appState.tools[toolName]?.[instanceId] || {}) : (appState.tools[toolName] || {});

    const setToolData = (data: any, instanceId?: string) => updateToolState(toolName, data, instanceId);

    return { toolData, setToolData };
};

export const useMiniToolInstanceIds = (toolName: string) => {
    const { appState, updateToolState } = useContext(AppContext);
    const instanceIds: string[] = Object.keys(appState.tools[toolName] || {});
    const setInstanceIds: (ids: string[]) => void = (ids: string[]) => {
        const newInstances = ids.map(id => appState.tools[toolName]?.[id] || {}).reduce((acc, curr, idx) => {
            acc[ids[idx]] = curr;
            return acc;
        }, {});
        updateToolState(toolName, newInstances);
    };
    return { instanceIds, setInstanceIds };
};