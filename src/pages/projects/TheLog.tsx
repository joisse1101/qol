import { useState } from 'react';
import { useLogs } from '@/hooks/useLogs';
import { getDisplayTime, getDisplayDate } from '@/utils/dates';
import { Button, Switch, TextArea } from '@joisse1101/ui-library';
import type { LogEntry } from '@/db/theLogsDb';

export default function TheLog() {
    const [isEditMode, setIsEditMode] = useState(false);
    const { logs, addLog, updateLog, removeLog } = useLogs();

    return (
        <div className="app-wrapper">
            <TextArea onSubmit={(text) => addLog(text)} />
            <Switch
                size="sm"
                label="Edit Mode"
                checked={isEditMode}
                onChange={(checked) => setIsEditMode(checked)}
            />
            <div className="logs-container">
                {logs.map(log => (
                    <>
                        {log.isLastOfDay && (
                            <div className="log-date"><span>
                                {getDisplayDate(new Date(log.createdAt))}
                            </span>
                            </div>
                        )}
                        <LogEntryComponent key={log.id} log={log} isEdit={isEditMode} onRemove={removeLog} onUpdate={updateLog} />
                    </>
                ))}
            </div>
        </div>
    );
}

const LogEntryComponent = ({ log, isEdit, onRemove, onUpdate }: {
    log: LogEntry;
    isEdit: boolean;
    onRemove: (id: string) => void;
    onUpdate: (id: string, partialLog: Partial<Omit<LogEntry, 'id' | 'createdAt' | 'updatedAt'>>) => void
}) => {
    return (
        <div className="card log-entry">
            <p className="log-entry-content">{log.content}</p>
            <div className="log-entry-metadata">
                {isEdit && (
                    <>
                        <Button
                            onClick={() => onUpdate(log.id, { content: prompt('Edit log entry:', log.content) || log.content })}
                            variant="secondary"
                            icon={true}
                        >
                            ✎
                        </Button>
                        <Button
                            onClick={() => onRemove(log.id)}
                            variant="danger"
                            icon={true}
                        >
                            ✕
                        </Button>
                    </>
                )}
                <h6 className="log-entry-date">{getDisplayTime(new Date(log.createdAt))}</h6>
            </div>
        </div>
    )
};