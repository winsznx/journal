import { useState, useEffect, useCallback } from 'react';
import { MoodType } from '../types';
import { STORAGE_KEYS, MAX_TITLE_LENGTH, MAX_CONTENT_LENGTH, MAX_TAGS } from '../constants';

interface DraftData {
    title: string;
    content: string;
    mood: MoodType;
    tags: string[];
    isPrivate: boolean;
}

export const useEntryForm = () => {
    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');
    const [mood, setMood] = useState<MoodType>('neutral');
    const [tags, setTags] = useState<string[]>([]);
    const [tagInput, setTagInput] = useState('');
    const [isPrivate, setIsPrivate] = useState(false);
    const [errors, setErrors] = useState<string[]>([]);

    // Load draft from localStorage
    useEffect(() => {
        const savedDraft = localStorage.getItem(STORAGE_KEYS.DRAFT);
        if (savedDraft) {
            try {
                const draft: DraftData = JSON.parse(savedDraft);
                setTitle(draft.title || '');
                setContent(draft.content || '');
                setMood(draft.mood || 'neutral');
                setTags(draft.tags || []);
                setIsPrivate(draft.isPrivate || false);
            } catch (err) {
                console.error('Failed to load draft:', err);
            }
        }
    }, []);

    // Auto-save draft
    useEffect(() => {
        if (title || content) {
            const draft: DraftData = {
                title,
                content,
                mood,
                tags,
                isPrivate,
            };
            localStorage.setItem(STORAGE_KEYS.DRAFT, JSON.stringify(draft));
        }
    }, [title, content, mood, tags, isPrivate]);

    // Validate form
    const validate = useCallback((): boolean => {
        const newErrors: string[] = [];

        if (!title.trim()) {
            newErrors.push('Title is required');
        }

        if (title.length > MAX_TITLE_LENGTH) {
            newErrors.push(`Title must be ${MAX_TITLE_LENGTH} characters or less`);
        }

        if (!content.trim()) {
            newErrors.push('Content is required');
        }

        if (content.length > MAX_CONTENT_LENGTH) {
            newErrors.push(`Content must be ${MAX_CONTENT_LENGTH} characters or less`);
        }

        if (tags.length > MAX_TAGS) {
            newErrors.push(`Maximum ${MAX_TAGS} tags allowed`);
        }

        setErrors(newErrors);
        return newErrors.length === 0;
    }, [title, content, tags]);

    // Add tag
    const addTag = useCallback(() => {
        const trimmedTag = tagInput.trim();
        if (trimmedTag && !tags.includes(trimmedTag) && tags.length < MAX_TAGS) {
            setTags([...tags, trimmedTag]);
            setTagInput('');
        }
    }, [tagInput, tags]);

    // Remove tag
    const removeTag = useCallback(
        (tagToRemove: string) => {
            setTags(tags.filter((tag) => tag !== tagToRemove));
        },
        [tags]
    );

    // Clear form
    const clearForm = useCallback(() => {
        setTitle('');
        setContent('');
        setMood('neutral');
        setTags([]);
        setTagInput('');
        setIsPrivate(false);
        setErrors([]);
        localStorage.removeItem(STORAGE_KEYS.DRAFT);
    }, []);

    // Set form data (for editing)
    const setFormData = useCallback(
        (data: {
            title: string;
            content: string;
            mood: MoodType;
            tags: string[];
            isPrivate: boolean;
        }) => {
            setTitle(data.title);
            setContent(data.content);
            setMood(data.mood);
            setTags(data.tags);
            setIsPrivate(data.isPrivate);
        },
        []
    );

    return {
        title,
        setTitle,
        content,
        setContent,
        mood,
        setMood,
        tags,
        setTags,
        tagInput,
        setTagInput,
        isPrivate,
        setIsPrivate,
        errors,
        validate,
        addTag,
        removeTag,
        clearForm,
        setFormData,
        charactersRemaining: {
            title: MAX_TITLE_LENGTH - title.length,
            content: MAX_CONTENT_LENGTH - content.length,
        },
    };
};
