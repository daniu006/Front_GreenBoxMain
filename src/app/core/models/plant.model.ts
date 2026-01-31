export interface Plant {
    id: string;
    name: string;
    type: string;
    imageUrl: string;
    description?: string;
    difficulty?: 'Fácil' | 'Medio' | 'Difícil';
    benefits?: string[];
    isActive?: boolean;
    optimalConditions?: {
        tempMin: number;
        tempMax: number;
        humMin: number;
        humMax: number;
        lightMin: number;
        lightMax: number;
    };
}

export interface GuideStep {
    step: number;
    title: string;
    description: string;
    image?: string;
    tips?: string[];
}
