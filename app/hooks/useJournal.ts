import { useReadContract, useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { CONTRACT_ADDRESS, JOURNAL_ABI } from '../contracts/Journal';
import { Entry } from '../types';
import { useCallback } from 'react';
import toast from 'react-hot-toast';

export const useJournal = (userAddress: `0x${string}` | undefined) => {
    // Read entries
    const {
        data: entries,
        isLoading: isLoadingEntries,
        refetch: refetchEntries,
    } = useReadContract({
        address: CONTRACT_ADDRESS as `0x${string}`,
        abi: JOURNAL_ABI,
        functionName: 'getUserEntries',
        args: userAddress ? [userAddress] : undefined,
    });

    // Read entry fee
    const { data: entryFee } = useReadContract({
        address: CONTRACT_ADDRESS as `0x${string}`,
        abi: JOURNAL_ABI,
        functionName: 'entryFee',
    });

    // Read user entry count
    const { data: entryCount } = useReadContract({
        address: CONTRACT_ADDRESS as `0x${string}`,
        abi: JOURNAL_ABI,
        functionName: 'getUserEntryCount',
        args: userAddress ? [userAddress] : undefined,
    });

    // Read mood stats
    const { data: moodStats, refetch: refetchMoodStats } = useReadContract({
        address: CONTRACT_ADDRESS as `0x${string}`,
        abi: JOURNAL_ABI,
        functionName: 'getMoodStats',
        args: userAddress ? [userAddress] : undefined,
    });

    // Write contract hook
    const { data: hash, writeContract, isPending, error } = useWriteContract();
    const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash });

    // Add entry
    const addEntry = useCallback(
        async (
            title: string,
            content: string,
            mood: string,
            tags: string[],
            isPrivate: boolean
        ) => {
            try {
                await writeContract({
                    address: CONTRACT_ADDRESS as `0x${string}`,
                    abi: JOURNAL_ABI,
                    functionName: 'addEntry',
                    args: [title, content, mood, tags, isPrivate],
                    value: entryFee as bigint,
                });
            } catch (err) {
                console.error('Failed to add entry:', err);
                toast.error('Failed to add entry. Please try again.');
            }
        },
        [writeContract, entryFee]
    );

    // Edit entry
    const editEntry = useCallback(
        async (
            entryId: bigint,
            title: string,
            content: string,
            mood: string,
            tags: string[]
        ) => {
            try {
                await writeContract({
                    address: CONTRACT_ADDRESS as `0x${string}`,
                    abi: JOURNAL_ABI,
                    functionName: 'editEntry',
                    args: [entryId, title, content, mood, tags],
                });
            } catch (err) {
                console.error('Failed to edit entry:', err);
                toast.error('Failed to edit entry. Please try again.');
            }
        },
        [writeContract]
    );

    // Delete entry
    const deleteEntry = useCallback(
        async (entryId: bigint) => {
            try {
                await writeContract({
                    address: CONTRACT_ADDRESS as `0x${string}`,
                    abi: JOURNAL_ABI,
                    functionName: 'deleteEntry',
                    args: [entryId],
                });
            } catch (err) {
                console.error('Failed to delete entry:', err);
                toast.error('Failed to delete entry. Please try again.');
            }
        },
        [writeContract]
    );

    // Toggle privacy
    const togglePrivacy = useCallback(
        async (entryId: bigint) => {
            try {
                await writeContract({
                    address: CONTRACT_ADDRESS as `0x${string}`,
                    abi: JOURNAL_ABI,
                    functionName: 'togglePrivacy',
                    args: [entryId],
                });
            } catch (err) {
                console.error('Failed to toggle privacy:', err);
                toast.error('Failed to toggle privacy. Please try again.');
            }
        },
        [writeContract]
    );

    return {
        entries: (entries as Entry[]) || [],
        isLoadingEntries,
        entryFee,
        entryCount,
        moodStats,
        refetchEntries,
        refetchMoodStats,
        addEntry,
        editEntry,
        deleteEntry,
        togglePrivacy,
        isPending,
        isConfirming,
        isSuccess,
        error,
    };
};
