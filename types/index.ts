export type CalculatorType = 'concrete' | 'flooring' | 'paint';

export interface Project {
    id: string;
    name: string;
    type: CalculatorType;
    createdAt: number;
    data: any; // Flexible payload depending on calculator
    result: any;
    note?: string;
}

export interface AppSettings {
    defaultWaste: string;
    defaultUnit: 'ft' | 'm';
}
