'use client';

export default function LoadingSkeleton() {
    return (
        <div className="space-y-4 animate-pulse">
            {[...Array(3)].map((_, i) => (
                <div key={i} className="bg-gray-900 p-6 rounded-lg border border-gray-700">
                    {/* Header */}
                    <div className="flex items-center gap-3 mb-4">
                        <div className="w-10 h-10 bg-gray-800 rounded-full" />
                        <div className="h-6 bg-gray-800 rounded w-1/3" />
                    </div>

                    {/* Content */}
                    <div className="space-y-2 mb-4">
                        <div className="h-4 bg-gray-800 rounded w-full" />
                        <div className="h-4 bg-gray-800 rounded w-5/6" />
                        <div className="h-4 bg-gray-800 rounded w-4/6" />
                    </div>

                    {/* Footer */}
                    <div className="h-3 bg-gray-800 rounded w-1/4" />
                </div>
            ))}
        </div>
    );
}
