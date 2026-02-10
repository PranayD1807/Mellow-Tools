import { Flex, Spinner, Text } from "@chakra-ui/react";
import React from "react";

interface SearchingLoaderProps {
    isSearching: boolean;
    text?: string;
}

const SearchingLoader: React.FC<SearchingLoaderProps> = ({
    isSearching,
    text
}) => {
    if (!isSearching && !text) return null;

    const displayText = isSearching ? "Searching..." : text;

    return (
        <Flex justify="center" my={4} py={2} width="100%">
            <Spinner size="sm" color="blue.500" />
            <Text ml={2} fontSize="sm" color="gray.500">
                {displayText}
            </Text>
        </Flex>
    );
};

export default SearchingLoader;
