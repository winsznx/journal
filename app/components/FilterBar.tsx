'use client';

import { Entry, FilterOptions, MoodType } from '../types';
import { useState } from 'react';
import { MOODS } from '../constants';
import { filterEntries, sortEntries } from '../utils';

interface FilterBarProps {
    entries: Entry[];
    onFilteredEntriesChange: (filtered: Entry[]) => void;
}

export default function FilterBar({ entries, onFilteredEntriesChange }: FilterBarProps) {
    const [search, setSearch] = useState('');
    const [selectedMood, setSelectedMood] = useState<MoodType | ''>('');
    const [privacyFilter, setPrivacyFilter] = useState<'all' | 'private' | 'public'>('all');
    const [sortBy, setSortBy] = useState<'newest' | 'oldest' | 'mood' | 'edited'>('newest');

    const applyFilters = () => {
        const filters: FilterOptions = {
            search: search || undefined,
            mood: selectedMood || undefined,
            isPrivate:
                privacyFilter === 'private' ? true : privacyFilter === 'public' ? false : undefined,
        };

        let filtered = filterEntries(entries, filters);
        filtered = sortEntries(filtered, sortBy);
        onFilteredEntriesChange(filtered);
    };

    // Apply filters whenever any filter changes
    useState(() => {
        applyFilters();
    });

    const handleSearchChange = (value: string) => {
        setSearch(value);
        setTimeout(applyFilters, 300); // Debounce
    };

    const handleMoodChange = (value: MoodType | '') => {
        setSelectedMood(value);
        applyFilters();
    };

    const handlePrivacyChange = (value: 'all' | 'private' | 'public') => {
        setPrivacyFilter(value);
        applyFilters();
    };

    const handleSortChange = (value: 'newest' | 'oldest' | 'mood' | 'edited') => {
        setSortBy(value);
        applyFilters();
    };

    const clearFilters = () => {
        setSearch('');
        setSelectedMood('');
        setPrivacyFilter('all');
        setSortBy('newest');
        onFilteredEntriesChange(sortEntries([...entries], 'newest'));
    };

    return (
        <div className="bg-card border border-border rounded-lg p-4 mb-6 space-y-4">
            {/* Search */}
            <div>
                <input
                    type="text"
                    placeholder="🔍 Search entries..."
                    value={search}
                    onChange={(e) => handleSearchChange(e.target.value)}
                    className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:border-primary-500 focus:outline-none"
                />
            </div>

            {/* Filters Row */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                {/* Mood Filter */}
                <div>
                    <label className="block text-xs text-gray-400 mb-1">Filter by Mood</label>
                    <select
                        value={selectedMood}
                        onChange={(e) => handleMoodChange(e.target.value as MoodType | '')}
                        className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white text-sm focus:border-primary-500 focus:outline-none"
                    >
                        <option value="">All Moods</option>
                        {MOODS.map((mood) => (
                            <option key={mood.value} value={mood.value}>
                                {mood.emoji} {mood.label}
                            </option>
                        ))}
                    </select>
                </div>

                {/* Privacy Filter */}
                <div>
                    <label className="block text-xs text-gray-400 mb-1">Privacy</label>
                    <select
                        value={privacyFilter}
                        onChange={(e) => handlePrivacyChange(e.target.value as any)}
                        className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white text-sm focus:border-primary-500 focus:outline-none"
                    >
                        <option value="all">All Entries</option>
                        <option value="private">Private Only</option>
                        <option value="public">Public Only</option>
                    </select>
                </div>

                {/* Sort */}
                <div>
                    <label className="block text-xs text-gray-400 mb-1">Sort By</label>
                    <select
                        value={sortBy}
                        onChange={(e) => handleSortChange(e.target.value as any)}
                        className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white text-sm focus:border-primary-500 focus:outline-none"
                    >
                        <option value="newest">Newest First</option>
                        <option value="oldest">Oldest First</option>
                        <option value="mood">By Mood</option>
                        <option value="edited">Recently Edited</option>
                    </select>
                </div>

                {/* Clear */}
                <div className="flex items-end">
                    <button
                        onClick={clearFilters}
                        className="w-full px-4 py-2 bg-gray-800 hover:bg-gray-700 text-white rounded-lg text-sm font-semibold transition-colors"
                    >
                        Clear Filters
                    </button>
                </div>
            </div>
        </div>
    );
}
