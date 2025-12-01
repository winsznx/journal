'use client';

import { Entry } from '../types';
import { calculateAnalytics, getMoodEmoji } from '../utils';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

interface AnalyticsDashboardProps {
    entries: Entry[];
}

const COLORS = ['#ec4899', '#f97316', '#8b5cf6', '#3b82f6', '#6b7280', '#6366f1', '#a855f7', '#ef4444'];

export default function AnalyticsDashboard({ entries }: AnalyticsDashboardProps) {
    if (entries.length === 0) {
        return (
            <div className="bg-card border border-border rounded-lg p-6 text-center">
                <p className="text-gray-400">No entries yet to generate analytics</p>
            </div>
        );
    }

    const analytics = calculateAnalytics(entries);

    // Prepare mood data for pie chart
    const moodData = Object.entries(analytics.moodDistribution)
        .filter(([_, count]) => count > 0)
        .map(([mood, count]) => ({
            name: mood,
            value: count,
            emoji: getMoodEmoji(mood as any),
        }));

    // Prepare monthly data for bar chart
    const monthlyData = Object.entries(analytics.entriesPerMonth)
        .map(([month, count]) => ({
            month,
            count,
        }))
        .sort((a, b) => a.month.localeCompare(b.month))
        .slice(-6); // Last 6 months

    return (
        <div className="space-y-6">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-gradient-to-br from-primary-900/30 to-primary-950/30 border border-primary-700 rounded-lg p-4">
                    <div className="text-3xl mb-2">📝</div>
                    <div className="text-2xl font-bold text-white">{analytics.totalEntries}</div>
                    <div className="text-sm text-gray-400">Total Entries</div>
                </div>

                <div className="bg-gradient-to-br from-blue-900/30 to-blue-950/30 border border-blue-700 rounded-lg p-4">
                    <div className="text-3xl mb-2">{getMoodEmoji(analytics.mostCommonMood)}</div>
                    <div className="text-2xl font-bold text-white capitalize">{analytics.mostCommonMood}</div>
                    <div className="text-sm text-gray-400">Most Common Mood</div>
                </div>

                <div className="bg-gradient-to-br from-purple-900/30 to-purple-950/30 border border-purple-700 rounded-lg p-4">
                    <div className="text-3xl mb-2">📊</div>
                    <div className="text-2xl font-bold text-white">{analytics.averageEntriesPerWeek.toFixed(1)}</div>
                    <div className="text-sm text-gray-400">Avg Entries/Week</div>
                </div>

                <div className="bg-gradient-to-br from-orange-900/30 to-orange-950/30 border border-orange-700 rounded-lg p-4">
                    <div className="text-3xl mb-2">🔥</div>
                    <div className="text-2xl font-bold text-white">{analytics.writingStreak}</div>
                    <div className="text-sm text-gray-400">Day Streak</div>
                </div>
            </div>

            {/* Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Mood Distribution */}
                <div className="bg-card border border-border rounded-lg p-6">
                    <h3 className="text-lg font-bold text-white mb-4">Mood Distribution</h3>
                    <ResponsiveContainer width="100%" height={250}>
                        <PieChart>
                            <Pie
                                data={moodData}
                                cx="50%"
                                cy="50%"
                                labelLine={false}
                                label={({ emoji, value }) => `${emoji} ${value}`}
                                outerRadius={80}
                                fill="#8884d8"
                                dataKey="value"
                            >
                                {moodData.map((_, index) => (
                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                ))}
                            </Pie>
                            <Tooltip />
                        </PieChart>
                    </ResponsiveContainer>
                </div>

                {/* Monthly Entries */}
                <div className="bg-card border border-border rounded-lg p-6">
                    <h3 className="text-lg font-bold text-white mb-4">Entries Per Month</h3>
                    <ResponsiveContainer width="100%" height={250}>
                        <BarChart data={monthlyData}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                            <XAxis dataKey="month" stroke="#9ca3af" />
                            <YAxis stroke="#9ca3af" />
                            <Tooltip
                                contentStyle={{
                                    backgroundColor: '#1f2937',
                                    border: '1px solid #374151',
                                    borderRadius: '0.5rem',
                                }}
                            />
                            <Bar dataKey="count" fill="#ec4899" radius={[8, 8, 0, 0]} />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>
        </div>
    );
}
