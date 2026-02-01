import { HStack, Text } from "@chakra-ui/react";
import { Button } from "@/components/ui/button";

interface PaginationProps {
    page: number;
    totalPages: number;
    totalResults: number;
    setPage: (page: number | ((p: number) => number)) => void;
}

const Pagination: React.FC<PaginationProps> = ({
    page,
    totalPages,
    totalResults,
    setPage,
}) => {
    if (totalPages <= 1) return null;

    return (
        <HStack gap={4} py={4}>
            <Button
                size="sm"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                variant="outline"
            >
                Previous
            </Button>
            <Text fontSize="sm" fontWeight="medium">
                Page {page} of {totalPages} ({totalResults} results)
            </Text>
            <Button
                size="sm"
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                variant="outline"
            >
                Next
            </Button>
        </HStack>
    );
};

export default Pagination;
