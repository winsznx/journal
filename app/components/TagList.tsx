import React from 'react';

interface TagListProps {
    tags: string[];
    onTagClick?: (tag: string) => void;
}

export default function TagList({ tags, onTagClick }: TagListProps) {
    if (!tags || tags.length === 0) return null;

    return (
        <div className="flex flex-wrap gap-2">
            {tags.map((tag, index) => (
                <span
                    key={`${tag}-${index}`}
                    onClick={() => onTagClick && onTagClick(tag)}
                    className={`
                        inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium
                        bg-primary-900/50 text-primary-200 border border-primary-800
                        ${onTagClick ? 'cursor-pointer hover:bg-primary-800 transition-colors' : ''}
                    `}
                >
                    #{tag}
                </span>
            ))}
        </div>
    );
}
