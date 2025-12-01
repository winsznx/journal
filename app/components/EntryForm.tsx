'use client';

import { FormEvent, useState } from 'react';
import { useEntryForm } from '../hooks/useEntryForm';
import MoodSelector from './MoodSelector';
import ConfirmModal from './ConfirmModal';
import toast from 'react-hot-toast';

interface EntryFormProps {
    entryFee?: bigint;
    onSubmit: (
        title: string,
        content: string,
        mood: string,
        tags: string[],
        isPrivate: boolean
    ) => Promise<void>;
    onCancel: () => void;
    isPending: boolean;
    isConfirming: boolean;
    isSuccess: boolean;
    editMode?: boolean;
    initialData?: {
        title: string;
        content: string;
        mood: string;
        tags: string[];
        isPrivate: boolean;
    };
}

export default function EntryForm({
    entryFee,
    onSubmit,
    onCancel,
    isPending,
    isConfirming,
    isSuccess,
    editMode = false,
    initialData,
}: EntryFormProps) {
    const {
        title,
        setTitle,
        content,
        setContent,
        mood,
        setMood,
        tags,
        tagInput,
        setTagInput,
        isPrivate,
        setIsPrivate,
        errors,
        validate,
        addTag,
        removeTag,
        clearForm,
        charactersRemaining,
    } = useEntryForm();

    const [showConfirm, setShowConfirm] = useState(false);

    // Load initial data for edit mode
    useState(() => {
        if (editMode && initialData) {
            // setFormData would be called here if implemented
        }
    });

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();

        if (!validate()) {
            toast.error('Please fix the errors in the form');
            return;
        }

        setShowConfirm(true);
    };

    const handleConfirm = async () => {
        setShowConfirm(false);
        await onSubmit(title, content, mood, tags, isPrivate);
    };

    // Clear form on success
    if (isSuccess && !editMode) {
        setTimeout(() => {
            clearForm();
            onCancel();
        }, 2000);
    }

    const handleTagKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            addTag();
        }
    };

    return (
        <>
            <form onSubmit={handleSubmit} className="mb-6 bg-gray-900 p-6 rounded-lg space-y-4">
                {/* Title */}
                <div>
                    <div className="flex items-center justify-between mb-2">
                        <label htmlFor="title" className="block text-sm font-semibold text-gray-300">
                            Title *
                        </label>
                        <span className="text-xs text-gray-500">
                            {charactersRemaining.title} characters remaining
                        </span>
                    </div>
                    <input
                        id="title"
                        type="text"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        placeholder="How was your day?"
                        className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20 transition-all"
                        required
                        maxLength={100}
                        disabled={isPending || isConfirming}
                    />
                </div>

                {/* Content */}
                <div>
                    <div className="flex items-center justify-between mb-2">
                        <label htmlFor="content" className="block text-sm font-semibold text-gray-300">
                            Entry *
                        </label>
                        <span className="text-xs text-gray-500">
                            {charactersRemaining.content} characters remaining
                        </span>
                    </div>
                    <textarea
                        id="content"
                        value={content}
                        onChange={(e) => setContent(e.target.value)}
                        rows={8}
                        placeholder="Write your thoughts..."
                        className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20 resize-none transition-all"
                        required
                        maxLength={10000}
                        disabled={isPending || isConfirming}
                    />
                </div>

                {/* Mood Selector */}
                <MoodSelector
                    selectedMood={mood}
                    onSelect={(value) => setMood(value)}
                    disabled={isPending || isConfirming}
                />

                {/* Tags */}
                <div>
                    <label htmlFor="tagInput" className="block text-sm font-semibold text-gray-300 mb-2">
                        Tags (Optional)
                    </label>
                    <div className="flex gap-2 mb-2">
                        <input
                            id="tagInput"
                            type="text"
                            value={tagInput}
                            onChange={(e) => setTagInput(e.target.value)}
                            onKeyPress={handleTagKeyPress}
                            placeholder="Add a tag..."
                            className="flex-1 px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:border-primary-500 focus:outline-none"
                            disabled={isPending || isConfirming || tags.length >= 10}
                        />
                        <button
                            type="button"
                            onClick={addTag}
                            disabled={!tagInput.trim() || tags.length >= 10 || isPending || isConfirming}
                            className="px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            Add
                        </button>
                    </div>

                    {/* Tag list */}
                    {tags.length > 0 && (
                        <div className="flex flex-wrap gap-2">
                            {tags.map((tag) => (
                                <span
                                    key={tag}
                                    className="inline-flex items-center gap-1 px-3 py-1 bg-primary-900/30 border border-primary-700 text-primary-300 rounded-full text-sm"
                                >
                                    {tag}
                                    <button
                                        type="button"
                                        onClick={() => removeTag(tag)}
                                        disabled={isPending || isConfirming}
                                        className="hover:text-primary-100 transition-colors"
                                        aria-label={`Remove ${tag} tag`}
                                    >
                                        ×
                                    </button>
                                </span>
                            ))}
                        </div>
                    )}
                </div>

                {/* Privacy Toggle */}
                <div className="flex items-center gap-2">
                    <input
                        type="checkbox"
                        id="isPrivate"
                        checked={isPrivate}
                        onChange={(e) => setIsPrivate(e.target.checked)}
                        className="w-4 h-4 accent-primary-600"
                        disabled={isPending || isConfirming}
                    />
                    <label htmlFor="isPrivate" className="text-gray-300 cursor-pointer">
                        🔒 Make this entry private (only you can view)
                    </label>
                </div>

                {/* Errors */}
                {errors.length > 0 && (
                    <div className="bg-red-900/30 border border-red-700 text-red-400 px-4 py-3 rounded-lg">
                        <ul className="list-disc list-inside space-y-1">
                            {errors.map((error, index) => (
                                <li key={index}>{error}</li>
                            ))}
                        </ul>
                    </div>
                )}

                {/* Submit */}
                <div className="flex items-center justify-between pt-4">
                    <p className="text-sm text-gray-400">
                        {!editMode && entryFee && (
                            <>
                                Fee: <span className="text-primary-500 font-bold">{Number(entryFee) / 1e18} ETH</span>
                            </>
                        )}
                    </p>
                    <div className="flex gap-2">
                        <button
                            type="button"
                            onClick={onCancel}
                            disabled={isPending || isConfirming}
                            className="px-6 py-2 bg-gray-800 hover:bg-gray-700 text-white rounded-lg font-semibold transition-colors disabled:opacity-50"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={isPending || isConfirming}
                            className="px-6 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg font-semibold transition-colors disabled:opacity-50"
                        >
                            {isPending && 'Sending...'}
                            {isConfirming && 'Confirming...'}
                            {!isPending && !isConfirming && (editMode ? 'Update Entry' : 'Save Entry')}
                        </button>
                    </div>
                </div>

                {/* Success Message */}
                {isSuccess && (
                    <div className="bg-green-900/30 border border-green-700 text-green-400 px-4 py-3 rounded-lg">
                        ✅ Entry {editMode ? 'updated' : 'saved'} successfully!
                    </div>
                )}
            </form>

            {/* Confirmation Modal */}
            <ConfirmModal
                isOpen={showConfirm}
                onClose={() => setShowConfirm(false)}
                onConfirm={handleConfirm}
                title={editMode ? 'Update Entry?' : 'Create Entry?'}
                message={
                    editMode
                        ? 'Are you sure you want to update this journal entry?'
                        : `Are you sure you want to create this journal entry? This will cost ${entryFee ? Number(entryFee) / 1e18 : '0.0000001'
                        } ETH.`
                }
            />
        </>
    );
}
