export interface SensorData {
    temp: number;
    hum: number;
    light: number;
    water: number;
    soilMoisture: number; // [NEW] Humedad del suelo
    timestamp?: string;
}

export interface SensorReading {
    timestamp: string;
    temperature: number;
    humidity: number;
    light: number;
    water: number;
    soilMoisture: number; // [NEW]
}

export interface ActuatorStatus {
    boxId: number;
    boxName: string;
    led: boolean;
    pump: boolean;
    wateringCount: number;
    lastWateringDate: string | null;
}

export interface Box {
    id: number;
    code: string;
    name: string;
    plantId?: number;
    wateringCount: number;
    lastWateringDate?: string;
    ledStatus: boolean;
    pumpStatus: boolean;
    createdAt: string;
}

export interface Plant {
    id: number;
    name: string;
    type?: string;
    imageUrl?: string;
    difficulty?: string;
    benefits?: string[];
    isActive?: boolean;
    minTemperature: number;
    maxTemperature: number;
    minHumidity: number;
    maxHumidity: number;
    lightHours: number;
    minWaterLevel: number;
    minSoilMoisture?: number;
    wateringFrequency: number;
    createdAt: string;
}

export interface Alert {
    id: number;
    boxId: number;
    type: string;
    message: string;
    priority: string;
    resolved: boolean;
    createdAt: string;
}
