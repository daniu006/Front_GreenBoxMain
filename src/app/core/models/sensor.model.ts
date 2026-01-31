export interface SensorData {
    temp: number;
    hum: number;
    light: number;
    water: number;
    timestamp?: Date;
}

export interface SensorStatus {
    status: 'good' | 'bad';
    statusText: string;
}

export interface ActuatorStatus {
    led: boolean;
    pump: boolean;
    wateringCount: number;
    lastWateringDate?: Date;
}

export interface HistoryDataPoint {
    value: number;
    percentage: number;
    day?: string;
    dayName?: string;
    date?: string;
    change?: number;
}
