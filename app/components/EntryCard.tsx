'use client';

import { useState } from 'react';
import { Entry } from '../types';
import { getMoodEmoji, getFullDate, getRelativeTime } from '../utils';
import ConfirmModal from './ConfirmModal';

interface EntryCardProps {
    entry: Entry;
    isOwner: boolean;
    onTogglePrivacy: (entryId: bigint) => void;
    onEdit: (entry: Entry) => void;
    onDelete: (entryId: bigint) => void;
    isProcessing: boolean;
}

export default function EntryCard({
    entry,
    isOwner,
    onTogglePrivacy,
    onEdit,
    onDelete,
    isProcessing,
}: EntryCardProps) {
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [isExpanded, setIsExpanded] = useState(false);

    const contentPreview = entry.content.length > 300 ? entry.content.substring(0, 300) + '...' : entry.content;

    return (
        <>
            <div className="bg-gray-900 p-6 rounded-lg border border-gray-700 hover:border-primary-600 transition-all transform hover:scale-[1.01]">
                {/* Header */}
                <div className="flex justify-between items-start mb-3">
                    <div className="flex items-center gap-3 flex-1">
                        <span className="text-3xl" role="img" aria-label={`${entry.mood} mood`}>
                            {getMoodEmoji(entry.mood)}
                        </span>
                        <h3 className="text-xl font-bold text-white break-words">{entry.title}</h3>
                    </div>

                    <div className="flex items-center gap-2 flex-shrink-0">
                        {entry.isPrivate && (
                            <span className="bg-gray-800 border border-gray-600 text-gray-400 px-3 py-1 rounded-full text-xs whitespace-nowrap">
                                🔒 Private
                            </span>
                        )}
                        {isOwner && (
                            <div className="flex gap-1">
                                <button
                                    onClick={() => onTogglePrivacy(entry.id)}
                                    disabled={isProcessing}
                                    className="text-gray-400 hover:text-primary-500 text-lg transition-colors p-1 disabled:opacity-50"
                                    title={entry.isPrivate ? 'Make Public' : 'Make Private'}
                                    aria-label={entry.isPrivate ? 'Make entry public' : 'Make entry private'}
                                >
                                    {entry.isPrivate ? '🔓' : '🔒'}
                                </button>
                                <button
                                    onClick={() => onEdit(entry)}
                                    disabled={isProcessing}
                                    className="text-gray-400 hover:text-blue-500 text-lg transition-colors p-1 disabled:opacity-50"
                                    title="Edit Entry"
                                    aria-label="Edit entry"
                                >
                                    ✏️
                                </button>
                                <button
                                    onClick={() => setShowDeleteConfirm(true)}
                                    disabled={isProcessing}
                                    className="text-gray-400 hover:text-red-500 text-lg transition-colors p-1 disabled:opacity-50"
                                    title="Delete Entry"
                                    aria-label="Delete entry"
                                >
                                    🗑️
                                </button>
                            </div>
                        )}
                    </div>
                </div>

                {/* Tags */}
                {entry.tags && entry.tags.length > 0 && (
                    <div className="flex flex-wrap gap-2 mb-3">
                        {entry.tags.map((tag) => (
                            <span
                                key={tag}
                                className="px-2 py-1 bg-primary-900/20 border border-primary-800 text-primary-400 rounded-full text-xs"
                            >
                                #{tag}
                            </span>
                        ))}
                    </div>
                )}

                {/* Content */}
                <div className="text-gray-300 mb-4 whitespace-pre-wrap break-words">
                    {isExpanded ? entry.content : contentPreview}
                    {entry.content.length > 300 && (
                        <button
                            onClick={() => setIsExpanded(!isExpanded)}
                            className="text-primary-500 hover:text-primary-400 ml-2 text-sm font-semibold"
                        >
                            {isExpanded ? 'Show less' : 'Read more'}
                        </button>
                    )}
                </div>

                {/* Footer */}
                <div className="text-xs text-gray-400">
                    <div>{getFullDate(entry.timestamp)}</div>
                    <div className="mt-1">
                        {getRelativeTime(entry.timestamp)}
                        {entry.lastEditedAt > 0n && (
                            <span className="ml-2 italic">(Edited {getRelativeTime(entry.lastEditedAt)})</span>
                        )}
                    </div>
                </div>
            </div>

            {/* Delete Confirmation */}
            <ConfirmModal
                isOpen={showDeleteConfirm}
                onClose={() => setShowDeleteConfirm(false)}
                onConfirm={() => {
                    setShowDeleteConfirm(false);
                    onDelete(entry.id);
                }}
                title="Delete Entry?"
                message="Are you sure you want to delete this entry? This action cannot be undone."
                confirmText="Delete"
                cancelText="Cancel"
            />
        </>
    );
}
