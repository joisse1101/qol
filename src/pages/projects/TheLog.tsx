import { useState, useRef } from 'react';
import { Button } from '@joisse1101/ui-library';

export default function TheLog() {
    const [logEntry, setLogEntry] = useState('');

    const textAreaRef = useRef<HTMLTextAreaElement>(null);
    const handleLogEntryInput = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        const textarea = textAreaRef.current;
        if (!textarea) return;
        textarea.style.height = 'auto';
        textarea.style.height = `${textarea.scrollHeight}px`;
        setLogEntry(e.target.value);
    }
    return (
        <div className="app-wrapper">
            <textarea ref={textAreaRef} style={{ resize: 'none', overflowY: 'hidden' }} placeholder="Enter log entry" value={logEntry} onChange={handleLogEntryInput} />
            <div className="btn-container">
                <Button onClick={() => console.log(logEntry)}>Add Log Entry</Button>
            </div>
            <h1>The Log Project</h1>
        </div>
    );
}