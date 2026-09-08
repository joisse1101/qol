import { useState, useRef } from 'react';
import { getDisplayDate } from '@/utils/dates';
import { useLogs } from '@/hooks/useLogs';
import { Button } from '@joisse1101/ui-library';

export default function TheLog() {
    const [logEntry, setLogEntry] = useState('');
    const { logs, addLog, updateLog, removeLog } = useLogs();

    const textAreaRef = useRef<HTMLTextAreaElement>(null);
    const handleLogEntryInput = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        const textarea = textAreaRef.current;
        if (!textarea) return;
        textarea.style.height = 'auto';
        textarea.style.height = `${textarea.scrollHeight}px`;
        setLogEntry(e.target.value);
    }

    const handleAddLog = () => {
        if (logEntry.trim() === '') return;
        addLog(logEntry);
        setLogEntry('');
    };
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
                <span className="textarea-hint">
                    Press <kbd>Ctrl</kbd> + <kbd>Enter</kbd> to submit
                </span>
            </div>
            <div className="logs-container">
                {logs.map(log => (
                    <LogEntryComponent key={log.id} log={log} onRemove={removeLog} onUpdate={updateLog} />
                ))}
            </div>
        </div>
    );
}

const LogEntryComponent = ({ log, onRemove, onUpdate }: { log: { id: string; content: string; createdAt: string; type: string }; onRemove: (id: string) => void; onUpdate: (id: string, partialLog: Partial<{ id: string; content: string; createdAt: string; type: string }>) => void }) => (
    <div className="log-entry">
        <h6 className="log-entry-date">{getDisplayDate(new Date(log.createdAt))}</h6>
        <p className="log-entry-content">{log.content}</p>
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
    </div>
);