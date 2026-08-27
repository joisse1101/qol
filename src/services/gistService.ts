import { Octokit } from '@octokit/rest';

const FILE_NAME = 'qol_data.json';
const GIST_DESCRIPTION = 'QoL App Data Gist';

export class GistSyncService {
    private octokit: Octokit;

    constructor(token: string) {
        this.octokit = new Octokit({ auth: token });
    }

    /**
     * Checks if the provided GitHub token is valid by attempting to fetch the authenticated user's information.
     * @returns boolean indicating whether the token is valid (true) or not (false).
     */
    async verifyToken(): Promise<boolean> {
        try {
            await this.octokit.rest.users.getAuthenticated();
            return true;
        } catch {
            return false;
        }
    }

    /**
     * Helper function to locate the Gist ID based on the description. If found, returns the Gist ID; otherwise, returns null.
     * @returns string | null - The Gist ID if found, or null if not found.
     */
    private async findGistId(): Promise<string | null> {
        const { data: gists } = await this.octokit.rest.gists.list();
        const appGist = gists.find((g) => g.description === GIST_DESCRIPTION);
        return appGist ? appGist.id : null;
    }

    /**
     * Loads data from the Gist. If the Gist exists and contains the expected file, it returns the parsed JSON data; otherwise, it returns null.
     * @returns Promise<T | null> - The parsed data from the Gist if available, or null if not found.
     */
    async loadData<T>(): Promise<T | null> {
        const gistId = await this.findGistId();
        if (!gistId) return null;

        const { data: gist } = await this.octokit.rest.gists.get({ gist_id: gistId });
        const file = gist.files?.[FILE_NAME];
        if (!file || !file.content) return null;

        return JSON.parse(file.content) as T;
    }

    /**
     * Saves the provided data to the Gist. If the Gist already exists, it updates the existing file; otherwise, it creates a new private Gist with the data.
     * @param data - The data object to be saved to the Gist.
     */
    async saveData(data: object): Promise<void> {
        const gistId = await this.findGistId();
        const content = JSON.stringify(data, null, 2);

        if (gistId) {
            // Update existing Gist
            await this.octokit.rest.gists.update({
                gist_id: gistId,
                files: { [FILE_NAME]: { content } },
            });
        } else {
            // Create new private Gist
            await this.octokit.rest.gists.create({
                description: GIST_DESCRIPTION,
                public: false, // Private Gist
                files: { [FILE_NAME]: { content } },
            });
        }
    }
}