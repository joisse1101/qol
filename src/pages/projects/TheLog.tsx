import { useState, useRef } from 'react';
import { getDisplayDate } from '@/utils/dates';
import { useLogs } from '@/hooks/useLogs';
import { Button, useMediaQuery, Switch } from '@joisse1101/ui-library';
import type { LogEntry } from '@/db/theLogsDb';

export default function TheLog() {
    const [logEntry, setLogEntry] = useState('');
    const [isEditMode, setIsEditMode] = useState(false);
    const { logs, addLog, updateLog, removeLog } = useLogs();

    const textAreaRef = useRef<HTMLTextAreaElement>(null);
    const handleLogEntryInput = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        const textarea = textAreaRef.current;
        if (!textarea) return;
        textarea.style.height = 'auto';
        textarea.style.height = `${textarea.scrollHeight}px`;
        setLogEntry(e.target.value);
    }

    const hasContent = logEntry.trim() !== '';

    const handleAddLog = () => {
        if (!hasContent) return;
        addLog(logEntry);
        setLogEntry('');
    };

    const isPhone = !useMediaQuery(600);
    return (
        <div className="app-wrapper">
            <div className="textarea-wrapper" style={{ position: 'relative', width: '100%' }}>
                <textarea
                    ref={textAreaRef}
                    style={{ resize: 'none', overflowY: 'hidden', width: '100%' }}
                    placeholder="What's up?"
                    value={logEntry}
                    onChange={handleLogEntryInput}
                    onKeyDown={(e) => {
                        if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
                            e.preventDefault();
                            handleAddLog();
                        }
                    }}
                />
                {hasContent && (
                    <span className="textarea-hint">
                        {isPhone ? (
                            <Button onClick={handleAddLog} variant="primary" icon={true}>
                                ➤
                            </Button>
                        ) : (
                            <>
                                    Press <kbd>Ctrl</kbd> + <kbd>Enter</kbd> to submit
                            </>
                        )
                        }
                    </span>
                )}
            </div>
            <Switch
                size="sm"
                label="Edit Mode"
                checked={isEditMode}
                onChange={(checked) => setIsEditMode(checked)}
            />
            <div className="logs-container">
                {logs.map(log => (
                    <LogEntryComponent key={log.id} log={log} isEdit={isEditMode} onRemove={removeLog} onUpdate={updateLog} />
                ))}
            </div>
        </div>
    );
}

const LogEntryComponent = ({ log, isEdit, onRemove, onUpdate }: {
    log: LogEntry;
    isEdit: boolean;
    onRemove: (id: string) => void;
    onUpdate: (id: string, partialLog: Partial<Omit<LogEntry, 'id' | 'createdAt'>>) => void
}) => {
    return (
        <div className="log-entry">
            <h6 className="log-entry-date">{getDisplayDate(new Date(log.createdAt))}</h6>
            <p className="log-entry-content">{log.content}</p>
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
        </div>
    )
};