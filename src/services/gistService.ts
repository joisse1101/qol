import { Octokit } from '@octokit/rest';
import { z } from 'zod';
import { ToolInstanceSchema } from '@/db/db';
import { toast } from 'sonner';

const FILE_NAME = 'qol_data.json';
const GIST_DESCRIPTION = 'QoL App Data Gist';

export const FlatGistPayloadSchema = z.object({
    version: z.number(),
    updatedAt: z.string(),
    tools: z.array(ToolInstanceSchema),
});

export type FlatGistPayload = z.infer<typeof FlatGistPayloadSchema>;

export class GistSyncService {
    private octokit: Octokit;

    constructor(token: string) {
        this.octokit = new Octokit({ auth: token });
    }

    /**
     * Checks if the GitHub token is valid.
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
     * Locates the Gist ID based on the matching description.
     */
    private async findGistId(): Promise<string | null> {
        // Set per_page: 100 to reduce chances of missing the gist due to pagination
        const { data: gists } = await this.octokit.rest.gists.list({ per_page: 100 });
        const appGist = gists.find((g) => g.description === GIST_DESCRIPTION);
        return appGist ? appGist.id : null;
    }

    /**
     * Loads and parses data from the Gist using FlatGistPayloadSchema.
     */
    async loadData(): Promise<FlatGistPayload | null> {
        const gistId = await this.findGistId();
        if (!gistId) return null;

        const { data: gist } = await this.octokit.rest.gists.get({ gist_id: gistId });
        const file = gist.files?.[FILE_NAME];
        if (!file || !file.content) return null;

        try {
            const rawJson = JSON.parse(file.content);

            // Validates against flat Dexie payload schema
            const validatedPayload = FlatGistPayloadSchema.parse(rawJson);
            toast.success('Data loaded successfully from GitHub Gist!');
            return validatedPayload;
        } catch (e) {
            console.error('Error parsing Gist data:', e);
            console.log('Raw Gist content:', file.content);
            toast.error('Failed to parse data from GitHub Gist.');
            return null;
        }
    }

    /**
     * Saves flat database records payload to the Gist.
     */
    async saveData(data: FlatGistPayload): Promise<void> {
        const gistId = await this.findGistId();
        const content = JSON.stringify(data, null, 2);

        if (gistId) {
            await this.octokit.rest.gists.update({
                gist_id: gistId,
                files: { [FILE_NAME]: { content } },
            });
        } else {
            await this.octokit.rest.gists.create({
                description: GIST_DESCRIPTION,
                public: false,
                files: { [FILE_NAME]: { content } },
            });
        }
    }
}