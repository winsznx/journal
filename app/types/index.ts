// Type definitions for Journal DApp

export interface Entry {
    id: bigint;
    owner: string;
    title: string;
    content: string;
    mood: MoodType;
    tags: string[];
    isPrivate: boolean;
    timestamp: bigint;
    lastEditedAt: bigint;
    exists: boolean;
    deleted: boolean;
}

export type MoodType =
    | 'happy'
    | 'excited'
    | 'grateful'
    | 'calm'
    | 'neutral'
    | 'sad'
    | 'anxious'
    | 'angry';

export interface Mood {
    value: MoodType;
    emoji: string;
    label: string;
    color: string;
}

export interface MoodStats {
    moods: string[];
    counts: bigint[];
}

export interface EntryFormData {
    title: string;
    content: string;
    mood: MoodType;
    tags: string[];
    isPrivate: boolean;
}

export interface FilterOptions {
    mood?: MoodType;
    isPrivate?: boolean;
    search?: string;
    startDate?: Date;
    endDate?: Date;
}

export interface SortOption {
    value: 'newest' | 'oldest' | 'mood' | 'edited';
    label: string;
}

export interface ExportFormat {
    format: 'json' | 'csv' | 'markdown';
    includePrivate: boolean;
}

export interface AnalyticsData {
    totalEntries: number;
    moodDistribution: Record<MoodType, number>;
    entriesPerMonth: Record<string, number>;
    averageEntriesPerWeek: number;
    mostCommonMood: MoodType;
    writingStreak: number;
}

export interface ToastOptions {
    title: string;
    description?: string;
    status: 'success' | 'error' | 'warning' | 'info';
    duration?: number;
}
