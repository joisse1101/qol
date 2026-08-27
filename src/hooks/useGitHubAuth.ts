import { useState, useEffect, useRef } from 'react';
import { AuthService } from '../services/authService';

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
                })
                .catch((err) => {
                    console.error(err);
                    setStatus('error');
                })
                .finally(() => {
                    setIsLoading(false);
                });
        }
    }, []);

    const login = () => AuthService.initiateLogin();

    const logout = () => {
        AuthService.logout();
        setToken(null);
        setStatus('logged-out');
    };

    return { token, status, isLoading, login, logout };
};