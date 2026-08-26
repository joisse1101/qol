import colors from '@/styles/variables.module.scss';
const hexToRgb = (hex: string): [number, number, number] => {
    const cleanHex = hex.replace(/^#/, '');
    return [
        parseInt(cleanHex.substring(0, 2), 16),
        parseInt(cleanHex.substring(2, 4), 16),
        parseInt(cleanHex.substring(4, 6), 16),
    ];
};

const rgbToHex = (rgb: [number, number, number]): string => {
    const toHex = (n: number) => Math.round(n).toString(16).padStart(2, '0');
    return `#${toHex(rgb[0])}${toHex(rgb[1])}${toHex(rgb[2])}`;
};

export const interpolateColors = (hex1: string, hex2: string, steps: number): string[] => {
    const c1 = hexToRgb(hex1);
    const c2 = hexToRgb(hex2);
    const divisions = steps + 1;
    const result: string[] = [];

    for (let i = 0; i <= divisions; i++) {
        const factor = i / divisions;
        const interp: [number, number, number] = [
            c1[0] + factor * (c2[0] - c1[0]),
            c1[1] + factor * (c2[1] - c1[1]),
            c1[2] + factor * (c2[2] - c1[2]),
        ];
        result.push(rgbToHex(interp));
    }
    return result;
};

export type GoalStatus = 'stretch' | 'success' | 'warning' | 'danger';

export interface ThemeColors {
    colorStretch: string;
    colorSuccess: string;
    colorWarning: string;
    colorDanger: string;
}

export function getStatusColor(status: GoalStatus): string {
    switch (status) {
        case 'stretch': return colors.colorStretch;
        case 'success': return colors.colorSuccess;
        case 'warning': return colors.colorWarning;
        case 'danger': return colors.colorDanger;
    }
}