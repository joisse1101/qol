import { useState, useEffect, useRef } from 'react';
import { AuthService } from '../services/authService';
import { toast } from 'sonner';

export const useGitHubAuth = () => {
    const [token, setToken] = useState<string | null>(AuthService.getStoredToken());
    const [status, setStatus] = useState<'logged-in' | 'logged-out' | 'exchanging' | 'error' | ''>('');
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const hasExchangedCode = useRef(false);

    useEffect(() => {
        const urlParams = new URLSearchParams(window.location.search);
        const code = urlParams.get('code');
        const verifier = localStorage.getItem('pkce_code_verifier');

        if (code && verifier && !hasExchangedCode.current) {
            hasExchangedCode.current = true;
            setIsLoading(true);
            setStatus('exchanging');

            AuthService.exchangeCodeForToken(code, verifier)
                .then((newToken) => {
                    setToken(newToken);
                    setStatus('logged-in');
                    toast.success('Successfully logged in with GitHub!');
                })
                .catch((err) => {
                    console.error(err);
                    setStatus('error');
                    toast.error('Failed to log in with GitHub. Please try again.');
                })
                .finally(() => {
                    setIsLoading(false);
                });
        }
    }, []);

    const login = () => {
        toast.info('Redirecting to GitHub for authentication...');
        AuthService.initiateLogin()
    };

    const logout = () => {
        AuthService.logout();
        setToken(null);
        setStatus('logged-out');
        toast.success('Logged out of GitHub.');
    };

    return { token, status, isLoading, login, logout };
};