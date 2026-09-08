import { Outlet } from 'react-router-dom';
import { Header, Footer } from '@joisse1101/ui-library';
import { useGitHubAuth } from '@/hooks/useGitHubAuth';
import { useGistSync } from '@/hooks/useGistSync';
import { useState } from 'react';
import { useMediaQuery } from '@joisse1101/ui-library';
import { SyncModal } from '@/components/SyncModal';
export function MainLayout() {
    const { token, status, isLoading, login, logout } = useGitHubAuth();
    const { handleSave, handleLoad, getSyncStatus } = useGistSync(token || '');
    const [syncStatus, setSyncedStatus] = useState<'local' | 'remote' | 'synced'>('synced');
    const [isSyncModalOpen, setIsSyncModalOpen] = useState<boolean>(false);

    const handleAuthAction = () => {
        if (status === 'logged-in') {
            logout();
        } else {
            login();
        }
    }

    const handleOpenSyncModal = async () => {
        setSyncedStatus(await getSyncStatus());
        setIsSyncModalOpen(true);
    };

    const isPhone = !useMediaQuery(600);

    return (
        <div className="layout">
            <Header links={[
                { label: 'Goal Tracker', href: '/qol/goal-tracker' },
                { label: 'The Log', href: '/qol/the-log' },
                { label: 'The Board', href: '/qol/the-board' },
                { label: 'Granny Square', href: '/qol/granny-square' },
            ]} >
                <button className={`btn btn-icon ${status === 'logged-in' ? 'btn-success' : 'btn-danger'}`} onClick={handleAuthAction} disabled={isLoading}>
                    <svg viewBox="0 0 16 15" width="16" height="15" fill="currentColor" xmlns="http://w3.org">
                        <path d="M7 1h2v7H7V1zm3.8 2.2l1.4-1.4A7 7 0 1 1 2.8 1.8l1.4 1.4A5 5 0 1 0 10.8 3.2z" />
                    </svg>
                </button>
                {status === 'logged-in' &&
                    <>
                    {!isPhone && <>
                        <button className="btn btn-icon" onClick={handleSave} title="Upload to Gist">
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M14 10v2.5a1.5 1.5 0 0 1-1.5 1.5h-9A1.5 1.5 0 0 1 2 12.5V10"></path>
                                <polyline points="11 5 8 2 5 5"></polyline>
                                <line x1="8" y1="2" x2="8" y2="10"></line>
                            </svg>
                        </button>
                        <button className="btn btn-icon" onClick={handleLoad} title="Download from Gist">
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M14 10v2.5a1.5 1.5 0 0 1-1.5 1.5h-9A1.5 1.5 0 0 1 2 12.5V10"></path>
                                <polyline points="5 7 8 10 11 7"></polyline>
                                <line x1="8" y1="10" x2="8" y2="2"></line>
                            </svg>
                        </button>
                    </>}
                    <button className="btn btn-icon" onClick={handleOpenSyncModal} title="Sync State with Gist">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M3 12a9 9 0 0 1 15-6.7L21 8" />
                            <path d="M21 3v5h-5" />
                            <path d="M21 12a9 9 0 0 1-15 6.7L3 16" />
                            <path d="M3 21v-5h5" />
                        </svg>
                    </button>
                </>
                }
            </Header>
            <main>
                <Outlet /> {/* Child routes render here */}
            </main>

            <Footer />
            <SyncModal
                isOpen={isSyncModalOpen}
                onClose={() => setIsSyncModalOpen(false)}
                handleLoad={handleLoad}
                handleSave={handleSave}
                syncStatus={syncStatus}
            />
        </div>
    );
}