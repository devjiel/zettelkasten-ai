export interface Note {
    id: string;
    title: string;
    content: string;
    tags: string[];
    metadata?: {
        createdAt?: string;
        updatedAt?: string;
        [key: string]: any;
    };
} 