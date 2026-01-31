export type CalculatorType = 'concrete' | 'flooring' | 'paint';

export interface Project {
    id: string;
    name: string;
    type: CalculatorType;
    createdAt: number;
    data: any; // Flexible payload depending on calculator
    result: any;
    note?: string;
    checklist?: ChecklistItem[];
}

export interface AppSettings {
    defaultWaste: string;
    defaultUnit: 'ft' | 'm';
}

export interface ChecklistItem {
    id: string;
    text: string;
    checked: boolean;
}

export interface ChecklistItem {
    id: string;
    text: string;
    checked: boolean;
}
