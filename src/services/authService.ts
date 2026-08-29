import { generateCodeVerifier, generateCodeChallenge } from '../utils/pkce';

const CLIENT_ID = 'Iv23liYcEskN84hXAKFH';
const REDIRECT_URI = window.location.origin + window.location.pathname;
const PROXY_URL = 'https://github-cors-proxy.thoiwei.workers.dev/';

export class AuthService {
    static getStoredToken(): string | null {
        return localStorage.getItem('github_oauth_token');
    }

    static async initiateLogin(): Promise<void> {
        const verifier = generateCodeVerifier();
        const challenge = await generateCodeChallenge(verifier);

        localStorage.setItem('pkce_code_verifier', verifier);

        const authUrl = new URL('https://github.com/login/oauth/authorize');
        authUrl.searchParams.append('client_id', CLIENT_ID);
        authUrl.searchParams.append('redirect_uri', REDIRECT_URI);
        authUrl.searchParams.append('scope', 'gist');
        authUrl.searchParams.append('code_challenge', challenge);
        authUrl.searchParams.append('code_challenge_method', 'S256');

        window.location.href = authUrl.toString();
    }

    static async exchangeCodeForToken(code: string, verifier: string): Promise<string> {
        const response = await fetch(PROXY_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Accept: 'application/json',
            },
            body: JSON.stringify({
                client_id: CLIENT_ID,
                code,
                redirect_uri: REDIRECT_URI,
                code_verifier: verifier,
            }),
        });

        const data = await response.json();

        if (data.access_token) {
            localStorage.setItem('github_oauth_token', data.access_token);
            localStorage.removeItem('pkce_code_verifier');
            window.history.replaceState({}, document.title, window.location.pathname);
            return data.access_token;
        }

        localStorage.removeItem('pkce_code_verifier');
        localStorage.removeItem('github_oauth_token');
        throw new Error(data.error_description || 'Authentication failed');
    }

    static logout(): void {
        localStorage.removeItem('github_oauth_token');
        localStorage.removeItem('pkce_code_verifier');
    }
}