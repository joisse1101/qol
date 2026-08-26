export const downloadGridCSV = (data: string[][], filename: string = 'download.csv'): void => {
    // Convert 2D array to CSV format with escaping
    const csvContent = data
        .map((row) =>
            row
                .map((field) => {
                    const escaped = field.replace(/"/g, '""');
                    return /[",\n\r]/.test(field) ? `"${escaped}"` : field;
                })
                .join(',')
        )
        .join('\n');

    // Add BOM (\uFEFF) to ensure UTF-8 characters render correctly in Excel
    const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);

    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();

    // Cleanup DOM and memory
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
};

export const parseGridCSV = (csvText: string, gridSize: number): string[][] => {
    const result: string[][] = [];
    let row: string[] = [];
    let field = '';
    let inQuotes = false;

    // Normalize line breaks
    const text = csvText.replace(/\r\n/g, '\n').replace(/\r/g, '\n');

    for (let i = 0; i < text.length; i++) {
        const char = text[i];
        const nextChar = text[i + 1];

        if (inQuotes) {
            if (char === '"' && nextChar === '"') {
                field += '"'; // Escaped quote
                i++; // Skip next quote
            } else if (char === '"') {
                inQuotes = false; // Closing quote
            } else {
                field += char;
            }
        } else {
            if (char === '"') {
                inQuotes = true; // Opening quote
            } else if (char === ',') {
                row.push(field);
                field = '';
            } else if (char === '\n') {
                row.push(field);
                result.push(row);
                row = [];
                field = '';
            } else {
                field += char;
            }
        }
    }

    // Push last field/row if content exists
    if (field || row.length > 0) {
        row.push(field);
        result.push(row);
    }

    // Ensure the result matches the specified grid size
    if (result.length > gridSize) {
        result.length = gridSize; // Trim extra rows
    }
    if (result.some((r) => r.length > gridSize)) {
        result.forEach((r) => {
            if (r.length > gridSize) {
                r.length = gridSize; // Trim extra columns
            }
        });
    }
    // Pad with empty rows if necessary
    while (result.length < gridSize) {
        result.push(Array.from({ length: gridSize }, () => ''));
    }
    if (result.some((r) => r.length < gridSize)) {
        result.forEach((r) => {
            while (r.length < gridSize) {
                r.push('');
            }
        });
    }

    return result;
};