import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { ApiResponse } from "@/models/ApiResponse";

interface UseIterativeSearchProps<T extends { id: string }> {
    fetchFunction: (page: number, limit: number) => Promise<ApiResponse<T[]>>;
    searchQuery: string;
    filterFunction: (item: T, query: string) => boolean;
    pageSize?: number;
    requestLimit?: number;
}

export function useIterativeSearch<T extends { id: string }>({
    fetchFunction,
    searchQuery,
    filterFunction,
    pageSize = 20,
    requestLimit = pageSize,
    enabled = true,
}: UseIterativeSearchProps<T> & { enabled?: boolean }) {
    const [allMatches, setAllMatches] = useState<T[]>([]);
    const [currentPage, setCurrentPage] = useState(0);
    const [loading, setLoading] = useState<boolean>(false);
    const [isSearching, setIsSearching] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    const [serverExhausted, setServerExhausted] = useState(false);


    const serverPageRef = useRef(1);
    const mountedRef = useRef(true);
    const abortControllerRef = useRef<AbortController | null>(null);

    useEffect(() => {
        mountedRef.current = true;
        return () => {
            mountedRef.current = false;
            abortControllerRef.current?.abort();
        };
    }, []);


    useEffect(() => {
        setAllMatches([]);
        setCurrentPage(0);
        setServerExhausted(false);
        serverPageRef.current = 1;
        abortControllerRef.current?.abort();
    }, [searchQuery, fetchFunction]);

    const fetchMore = useCallback(async () => {
        if (!enabled || serverExhausted || loading || isSearching) return;

        setLoading(true);
        if (searchQuery.trim()) setIsSearching(true);
        setError(null);

        try {
            let hasMoreOnServer = true;
            let currentMatches = [...allMatches];

            const targetCount = (currentPage + 1) * pageSize;

            while (
                currentMatches.length < targetCount &&
                hasMoreOnServer &&
                mountedRef.current
            ) {
                const effectiveLimit = searchQuery.trim() ? pageSize * 4 : requestLimit;
                const response = await fetchFunction(serverPageRef.current, effectiveLimit);

                if (response.status === "error") {
                    setError(response.err?.message || "Error fetching data");
                    break;
                }

                const fetchedItems = response.data || [];


                let validItems = fetchedItems;
                if (searchQuery.trim()) {
                    validItems = fetchedItems.filter(item => filterFunction(item, searchQuery));
                }


                const existingIds = new Set(currentMatches.map(i => i.id));
                const uniqueNewItems = validItems.filter(i => !existingIds.has(i.id));

                currentMatches = [...currentMatches, ...uniqueNewItems];
                setAllMatches(currentMatches);

                if (fetchedItems.length < requestLimit) {
                    hasMoreOnServer = false;
                    setServerExhausted(true);
                } else {
                    serverPageRef.current += 1;
                }


                await new Promise(resolve => setTimeout(resolve, 50));
            }
        } catch (err) {
            if (mountedRef.current) setError("An unexpected error occurred");
            console.error(err);
        } finally {
            if (mountedRef.current) {
                setLoading(false);
                setIsSearching(false);
            }
        }
    }, [enabled, serverExhausted, loading, isSearching, searchQuery, allMatches, currentPage, pageSize, fetchFunction, requestLimit, filterFunction]);


    useEffect(() => {
        const targetCount = (currentPage + 1) * pageSize;
        if (allMatches.length < targetCount && !serverExhausted && !loading && !isSearching) {
            fetchMore();
        }
    }, [currentPage, allMatches.length, serverExhausted, loading, isSearching, pageSize, fetchMore]);

    const pagedItems = useMemo(() => {
        const start = currentPage * pageSize;
        const end = start + pageSize;
        return allMatches.slice(start, end);
    }, [allMatches, currentPage, pageSize]);

    const hasMore = useMemo(() => {


        return allMatches.length > (currentPage + 1) * pageSize || !serverExhausted;
    }, [allMatches.length, currentPage, pageSize, serverExhausted]);

    const hasPrev = currentPage > 0;

    const nextPage = () => {
        if (hasMore) setCurrentPage(prev => prev + 1);
    };

    const prevPage = () => {
        if (hasPrev) setCurrentPage(prev => prev - 1);
    };

    return {
        items: pagedItems,
        setItems: setAllMatches,
        loading,
        isSearching,
        error,
        currentPage,
        pageSize,
        hasMore,
        hasPrev,
        nextPage,
        prevPage,
        totalBuffer: allMatches.length,
        serverExhausted
    };
}
