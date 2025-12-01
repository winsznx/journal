'use client';

import { MoodType } from '../types';
import { MOODS } from '../constants';

interface MoodSelectorProps {
    selectedMood: MoodType;
    onSelect: (mood: MoodType) => void;
    disabled?: boolean;
}

export default function MoodSelector({ selectedMood, onSelect, disabled }: MoodSelectorProps) {
    return (
        <div>
            <label className="block text-sm font-semibold text-gray-300 mb-2">Mood</label>
            <div className="grid grid-cols-4 md:grid-cols-8 gap-2">
                {MOODS.map((mood) => (
                    <button
                        key={mood.value}
                        type="button"
                        onClick={() => onSelect(mood.value)}
                        disabled={disabled}
                        className={`p-3 rounded-lg border-2 transition-all transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed ${selectedMood === mood.value
                                ? 'border-primary-500 bg-primary-900/30 scale-110 shadow-lg shadow-primary-500/20'
                                : 'border-gray-700 bg-gray-800 hover:border-gray-600'
                            }`}
                        aria-label={`Select ${mood.label} mood`}
                        title={mood.label}
                    >
                        <div className="text-2xl">{mood.emoji}</div>
                        <div className="text-xs text-gray-400 mt-1">{mood.label}</div>
                    </button>
                ))}
            </div>
        </div>
    );
}
