import { Outlet } from 'react-router-dom';
import { Header, Footer } from '@joisse1101/ui-library';
import { useGitHubAuth } from '@/hooks/useGitHubAuth';
export function MainLayout() {
    const { status, isLoading, login, logout } = useGitHubAuth();

    const handleAuthAction = () => {
        if (status === 'logged-in') {
            logout();
        } else {
            login();
        }
    }

    return (
        <div className="layout">
            <Header links={[{ label: 'Granny Square', href: '/qol/granny-square' }, { label: 'Goal Tracker', href: '/qol/goal-tracker' }]} >
                <button className={`btn btn-icon ${status === 'logged-in' ? 'btn-success' : 'btn-danger'}`} onClick={handleAuthAction} disabled={isLoading}>
                    <svg viewBox="0 0 16 15" width="16" height="15" fill="currentColor" xmlns="http://w3.org">
                        <path d="M7 1h2v7H7V1zm3.8 2.2l1.4-1.4A7 7 0 1 1 2.8 1.8l1.4 1.4A5 5 0 1 0 10.8 3.2z" />
                    </svg>
                </button>
                {status === 'logged-in' &&
                    <button className="btn btn-icon">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M3 12a9 9 0 0 1 15-6.7L21 8" />
                            <path d="M21 3v5h-5" />
                            <path d="M21 12a9 9 0 0 1-15 6.7L3 16" />
                            <path d="M3 21v-5h5" />
                        </svg>
                    </button>
                }
            </Header>
            <main>
                <Outlet /> {/* Child routes render here */}
            </main>

            <Footer />
        </div>
    );
}