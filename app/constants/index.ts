import { Mood, MoodType } from '../types';

export const MOODS: Mood[] = [
    { value: 'happy', emoji: '😊', label: 'Happy', color: 'text-yellow-400' },
    { value: 'excited', emoji: '🤩', label: 'Excited', color: 'text-orange-400' },
    { value: 'grateful', emoji: '🙏', label: 'Grateful', color: 'text-pink-400' },
    { value: 'calm', emoji: '😌', label: 'Calm', color: 'text-blue-400' },
    { value: 'neutral', emoji: '😐', label: 'Neutral', color: 'text-gray-400' },
    { value: 'sad', emoji: '😢', label: 'Sad', color: 'text-indigo-400' },
    { value: 'anxious', emoji: '😰', label: 'Anxious', color: 'text-purple-400' },
    { value: 'angry', emoji: '😠', label: 'Angry', color: 'text-red-400' },
];

export const DEFAULT_MOOD: MoodType = 'neutral';

export const MAX_TITLE_LENGTH = 100;
export const MAX_CONTENT_LENGTH = 10000;
export const MAX_TAGS = 10;

export const SKELETON_ENTRY_COUNT = 3;

export const STORAGE_KEYS = {
    DRAFT: 'journal_draft',
    FILTERS: 'journal_filters',
    SORT: 'journal_sort',
} as const;
