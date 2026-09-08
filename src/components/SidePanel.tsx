import { useState } from 'react';
import { Button } from '@joisse1101/ui-library';

export const SidePanel = () => {
    const [isOpen, setIsOpen] = useState(true);

    return (
        <>
            {/* The backdrop class is now controlled by the isOpen state */}
            <div
                className={`panel-backdrop ${isOpen ? 'open' : ''}`}
                onClick={() => setIsOpen(false)}
            ></div>

            <Button onClick={() => setIsOpen(!isOpen)}>Toggle Panel</Button>

            {/* The side panel class and accessibility are controlled by the isOpen state */}
            <aside
                className={`card side-panel ${isOpen ? 'open' : ''}`}
                aria-hidden={!isOpen}
            >
                <div className="panel-header">
                    <h3>Panel Title</h3>
                    <button
                        onClick={() => setIsOpen(false)}
                        aria-label="Close"
                    >
                        &times;
                    </button>
                </div>
                <div className="panel-body">
                    <p>Panel content goes here...</p>
                </div>
            </aside>
        </>
    );
};