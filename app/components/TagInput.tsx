import React, { useState, KeyboardEvent } from 'react';

interface TagInputProps {
    tags: string[];
    onChange: (tags: string[]) => void;
    placeholder?: string;
}

export default function TagInput({ tags, onChange, placeholder = 'Add tags...' }: TagInputProps) {
    const [input, setInput] = useState('');

    const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter' || e.key === ',') {
            e.preventDefault();
            addTag();
        } else if (e.key === 'Backspace' && input === '' && tags.length > 0) {
            removeTag(tags.length - 1);
        }
    };

    const addTag = () => {
        const trimmedInput = input.trim();
        if (trimmedInput && !tags.includes(trimmedInput)) {
            onChange([...tags, trimmedInput]);
            setInput('');
        }
    };

    const removeTag = (index: number) => {
        onChange(tags.filter((_, i) => i !== index));
    };

    return (
        <div className="flex flex-wrap gap-2 p-2 bg-gray-800 border border-gray-700 rounded-lg focus-within:border-primary-500 focus-within:ring-1 focus-within:ring-primary-500">
            {tags.map((tag, index) => (
                <span
                    key={index}
                    className="inline-flex items-center px-2 py-1 rounded-md text-sm bg-primary-900/50 text-primary-200 border border-primary-800"
                >
                    #{tag}
                    <button
                        type="button"
                        onClick={() => removeTag(index)}
                        className="ml-1.5 hover:text-white focus:outline-none"
                    >
                        ×
                    </button>
                </span>
            ))}
            <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                onBlur={addTag}
                placeholder={tags.length === 0 ? placeholder : ''}
                className="flex-1 min-w-[120px] bg-transparent border-none outline-none text-white placeholder-gray-500 text-sm"
            />
        </div>
    );
}
