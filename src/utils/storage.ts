// Regex matching ISO 8601 date strings
const ISO_DATE_REGEX = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d+)?(Z|[+-]\d{2}:?\d{2})?$/;

const dateReviver = (_key: string, value: any) => {
    if (typeof value === 'string' && ISO_DATE_REGEX.test(value)) {
        return new Date(value);
    }
    return value;
};

export const getStorageItem = <T>(key: string, defaultValue: T): T => {
    try {
        const item = localStorage.getItem(key);
        return item ? JSON.parse(item, dateReviver) : defaultValue;
    } catch {
        return defaultValue;
    }
};