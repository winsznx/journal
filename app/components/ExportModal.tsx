import React from 'react';
import { Entry } from '../types';
import { downloadCSV, downloadJSON } from '../utils/exportUtils';
import Button from './Button';

interface ExportModalProps {
    isOpen: boolean;
    onClose: () => void;
    entries: Entry[];
}

export default function ExportModal({ isOpen, onClose, entries }: ExportModalProps) {
    if (!isOpen) return null;

    const handleExportJSON = () => {
        downloadJSON(entries, `journal-export-${new Date().toISOString().split('T')[0]}`);
        onClose();
    };

    const handleExportCSV = () => {
        downloadCSV(entries, `journal-export-${new Date().toISOString().split('T')[0]}`);
        onClose();
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <div className="bg-card border border-border rounded-xl p-6 w-full max-w-md shadow-xl animate-scale-in">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-bold text-white">Export Entries</h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-white">
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                <p className="text-gray-400 mb-6">
                    Choose a format to export your {entries.length} journal entries.
                </p>

                <div className="space-y-3">
                    <Button
                        variant="secondary"
                        className="w-full justify-between group"
                        onClick={handleExportJSON}
                        rightIcon={
                            <span className="text-xs bg-gray-600 px-2 py-1 rounded group-hover:bg-gray-500">.json</span>
                        }
                    >
                        Export as JSON
                    </Button>

                    <Button
                        variant="secondary"
                        className="w-full justify-between group"
                        onClick={handleExportCSV}
                        rightIcon={
                            <span className="text-xs bg-gray-600 px-2 py-1 rounded group-hover:bg-gray-500">.csv</span>
                        }
                    >
                        Export as CSV
                    </Button>
                </div>

                <div className="mt-6 pt-6 border-t border-gray-800 flex justify-end">
                    <Button variant="ghost" onClick={onClose}>
                        Cancel
                    </Button>
                </div>
            </div>
        </div>
    );
}
