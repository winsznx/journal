import { Entry, FilterOptions, AnalyticsData, MoodType } from '../types';
import { formatDistanceToNow, format, startOfMonth, parseISO } from 'date-fns';

/**
 * Get mood emoji from mood value
 */
export const getMoodEmoji = (mood: MoodType): string => {
    const moodMap: Record<MoodType, string> = {
        happy: '😊',
        excited: '🤩',
        grateful: '🙏',
        calm: '😌',
        neutral: '😐',
        sad: '😢',
        anxious: '😰',
        angry: '😠',
    };
    return moodMap[mood] || '😐';
};

/**
 * Format timestamp to relative time
 */
export const getRelativeTime = (timestamp: bigint): string => {
    return formatDistanceToNow(new Date(Number(timestamp) * 1000), { addSuffix: true });
};

/**
 * Format timestamp to full date
 */
export const getFullDate = (timestamp: bigint): string => {
    return new Date(Number(timestamp) * 1000).toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
    });
};

/**
 * Filter entries based on filter options
 */
export const filterEntries = (entries: Entry[], filters: FilterOptions): Entry[] => {
    return entries.filter((entry) => {
        // Filter by mood
        if (filters.mood && entry.mood !== filters.mood) {
            return false;
        }

        // Filter by privacy
        if (filters.isPrivate !== undefined && entry.isPrivate !== filters.isPrivate) {
            return false;
        }

        // Filter by search term
        if (filters.search) {
            const searchLower = filters.search.toLowerCase();
            const titleMatch = entry.title.toLowerCase().includes(searchLower);
            const contentMatch = entry.content.toLowerCase().includes(searchLower);
            const tagsMatch = entry.tags.some((tag) => tag.toLowerCase().includes(searchLower));

            if (!titleMatch && !contentMatch && !tagsMatch) {
                return false;
            }
        }

        // Filter by date range
        if (filters.startDate) {
            const entryDate = new Date(Number(entry.timestamp) * 1000);
            if (entryDate < filters.startDate) {
                return false;
            }
        }

        if (filters.endDate) {
            const entryDate = new Date(Number(entry.timestamp) * 1000);
            if (entryDate > filters.endDate) {
                return false;
            }
        }

        return true;
    });
};

/**
 * Sort entries
 */
export const sortEntries = (
    entries: Entry[],
    sortBy: 'newest' | 'oldest' | 'mood' | 'edited'
): Entry[] => {
    const sorted = [...entries];

    switch (sortBy) {
        case 'newest':
            return sorted.sort((a, b) => Number(b.timestamp - a.timestamp));
        case 'oldest':
            return sorted.sort((a, b) => Number(a.timestamp - b.timestamp));
        case 'mood':
            return sorted.sort((a, b) => a.mood.localeCompare(b.mood));
        case 'edited':
            return sorted.sort((a, b) => Number(b.lastEditedAt - a.lastEditedAt));
        default:
            return sorted;
    }
};

/**
 * Calculate analytics from entries
 */
export const calculateAnalytics = (entries: Entry[]): AnalyticsData => {
    const moodDistribution: Record<MoodType, number> = {
        happy: 0,
        excited: 0,
        grateful: 0,
        calm: 0,
        neutral: 0,
        sad: 0,
        anxious: 0,
        angry: 0,
    };

    const entriesPerMonth: Record<string, number> = {};

    entries.forEach((entry) => {
        // Count moods
        if (entry.mood in moodDistribution) {
            moodDistribution[entry.mood as MoodType]++;
        }

        // Count entries per month
        const monthKey = format(new Date(Number(entry.timestamp) * 1000), 'yyyy-MM');
        entriesPerMonth[monthKey] = (entriesPerMonth[monthKey] || 0) + 1;
    });

    // Find most common mood
    const mostCommonMood = (
        Object.entries(moodDistribution).sort((a, b) => b[1] - a[1])[0]?.[0] || 'neutral'
    ) as MoodType;

    // Calculate average entries per week (last 12 weeks)
    const now = new Date();
    const twelveWeeksAgo = new Date(now.getTime() - 12 * 7 * 24 * 60 * 60 * 1000);
    const recentEntries = entries.filter((entry) => {
        const entryDate = new Date(Number(entry.timestamp) * 1000);
        return entryDate >= twelveWeeksAgo;
    });
    const averageEntriesPerWeek = recentEntries.length / 12;

    // Calculate writing streak
    const writingStreak = calculateWritingStreak(entries);

    return {
        totalEntries: entries.length,
        moodDistribution,
        entriesPerMonth,
        averageEntriesPerWeek,
        mostCommonMood,
        writingStreak,
    };
};

/**
 * Calculate current writing streak (consecutive days)
 */
const calculateWritingStreak = (entries: Entry[]): number => {
    if (entries.length === 0) return 0;

    const sortedEntries = [...entries].sort((a, b) => Number(b.timestamp - a.timestamp));
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    let streak = 0;
    let currentDate = new Date(today);

    for (const entry of sortedEntries) {
        const entryDate = new Date(Number(entry.timestamp) * 1000);
        entryDate.setHours(0, 0, 0, 0);

        const daysDiff = Math.floor(
            (currentDate.getTime() - entryDate.getTime()) / (1000 * 60 * 60 * 24)
        );

        if (daysDiff === 0 || daysDiff === 1) {
            if (daysDiff === 1) {
                currentDate = entryDate;
            }
            streak++;
        } else {
            break;
        }
    }

    return streak;
};

/**
 * Export entries to JSON
 */
export const exportToJSON = (entries: Entry[]): string => {
    return JSON.stringify(entries, (_, value) =>
        typeof value === 'bigint' ? value.toString() : value
    );
};

/**
 * Export entries to CSV
 */
export const exportToCSV = (entries: Entry[]): string => {
    const headers = ['ID', 'Title', 'Content', 'Mood', 'Tags', 'Private', 'Date'];
    const rows = entries.map((entry) => [
        entry.id.toString(),
        `"${entry.title.replace(/"/g, '""')}"`,
        `"${entry.content.replace(/"/g, '""')}"`,
        entry.mood,
        `"${entry.tags.join(', ')}"`,
        entry.isPrivate ? 'Yes' : 'No',
        getFullDate(entry.timestamp),
    ]);

    return [headers, ...rows].map((row) => row.join(',')).join('\n');
};

/**
 * Export entries to Markdown
 */
export const exportToMarkdown = (entries: Entry[]): string => {
    return entries
        .map((entry) => {
            const tags = entry.tags.length > 0 ? `\n**Tags:** ${entry.tags.join(', ')}` : '';
            const edited =
                entry.lastEditedAt > 0n
                    ? `\n*Edited: ${getFullDate(entry.lastEditedAt)}*`
                    : '';

            return `# ${entry.title}

**Date:** ${getFullDate(entry.timestamp)}  
**Mood:** ${getMoodEmoji(entry.mood)} ${entry.mood}  
**Private:** ${entry.isPrivate ? 'Yes' : 'No'}${tags}

${entry.content}${edited}

---
`;
        })
        .join('\n');
};

/**
 * Download file
 */
export const downloadFile = (content: string, filename: string, mimeType: string): void => {
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
};

/**
 * Truncate text
 */
export const truncateText = (text: string, maxLength: number): string => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
};

/**
 * Validate entry form data
 */
export const validateEntryForm = (
    title: string,
    content: string,
    tags: string[]
): { valid: boolean; errors: string[] } => {
    const errors: string[] = [];

    if (!title.trim()) {
        errors.push('Title is required');
    }

    if (title.length > 100) {
        errors.push('Title must be 100 characters or less');
    }

    if (!content.trim()) {
        errors.push('Content is required');
    }

    if (content.length > 10000) {
        errors.push('Content must be 10,000 characters or less');
    }

    if (tags.length > 10) {
        errors.push('Maximum 10 tags allowed');
    }

    return {
        valid: errors.length === 0,
        errors,
    };
};
