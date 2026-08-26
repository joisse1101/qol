/**
 * Serializes a JavaScript/TypeScript object into a formatted JSON file download.
 */
export const downloadJson = <T>(data: T, filename: string = 'data.json'): void => {
    const jsonString = JSON.stringify(data, null, 2);
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);

    const link = document.createElement('a');
    link.href = url;
    link.download = filename;

    document.body.appendChild(link);
    link.click();

    // Cleanup
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
};

/**
 * Reads a JSON file uploaded by the user and parses its contents.
 */
export const uploadJson = <T>(file: File): Promise<T> => {
    return new Promise((resolve, reject) => {
        const isJsonMime = file.type === 'application/json' || file.type === 'text/json';
        const isJsonExt = file.name.toLowerCase().endsWith('.json');
        if (!isJsonMime && !isJsonExt) {
            return reject(new Error('Invalid file type. Please upload a JSON file.'));
        }

        const reader = new FileReader();

        reader.onload = (event: ProgressEvent<FileReader>) => {
            try {
                const text = event.target?.result as string;
                const parsedData: T = JSON.parse(text);
                resolve(parsedData);
            } catch (error) {
                reject(error instanceof Error ? error : new Error('Failed to parse JSON content'));
            }
        };

        reader.onerror = () => reject(new Error('Error reading file'));
        reader.readAsText(file);
    });
};