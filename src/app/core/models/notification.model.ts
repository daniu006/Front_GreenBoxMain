export interface Notification {
    id: string;
    type: 'alert' | 'reminder' | 'system' | 'info';
    priority: 'high' | 'medium' | 'low';
    title: string;
    message: string;
    time: string;
    date: string;
    read: boolean;
    plantName?: string;
    plantId?: string;
    timestamp: Date;
}
