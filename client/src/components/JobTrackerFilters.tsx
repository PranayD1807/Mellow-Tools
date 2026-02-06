import {
    Box,
    Flex,
    HStack,
    IconButton,
    Input,
} from "@chakra-ui/react";
import { IoSearch } from "react-icons/io5";
import { HiViewGridAdd } from "react-icons/hi";
import { Button } from "@/components/ui/button";
import {
    SelectContent,
    SelectItem,
    SelectRoot,
    SelectTrigger,
    SelectValueText,
} from "@/components/ui/select";
import JobApplicationDialog from "./JobApplicationDialog";
import { CreateJobApplicationData } from "@/models/JobApplication";
import { ListCollection } from "@chakra-ui/react";

interface JobTrackerFiltersProps {
    searchInput: string;
    setSearchInput: (value: string) => void;
    handleSearch: () => void;
    handleKeyPress: (e: React.KeyboardEvent<HTMLInputElement>) => void;
    statusFilter: string;
    setStatusFilter: (value: string) => void;
    setPage: (value: number) => void;
    sortOrder: string;
    setSortOrder: (value: string) => void;
    statusOptions: ListCollection<{ label: string; value: string }>;
    sortOptions: ListCollection<{ label: string; value: string }>;
    handleCreateApplication: (values: CreateJobApplicationData) => Promise<void>;
}

const JobTrackerFilters: React.FC<JobTrackerFiltersProps> = ({
    searchInput,
    setSearchInput,
    handleSearch,
    handleKeyPress,
    statusFilter,
    setStatusFilter,
    setPage,
    sortOrder,
    setSortOrder,
    statusOptions,
    sortOptions,
    handleCreateApplication,
}) => {
    return (
        <Flex
            direction="column"
            width={{ base: "95%", sm: "90%", md: "95%", lg: "90%" }}
            gap={3}
        >
            <Flex
                direction={{ base: "column", lg: "row" }}
                justify="space-between"
                align={{ base: "stretch", lg: "center" }}
                gap={3}
            >
                {/* Left side: Search and filters */}
                <HStack flex="1" gap={2} flexWrap={{ base: "wrap", md: "nowrap" }}>
                    <Input
                        placeholder="Search..."
                        value={searchInput}
                        onChange={(e) => setSearchInput(e.target.value)}
                        onKeyDown={handleKeyPress}
                        maxW={{ base: "full", md: "300px" }}
                        h="36px"
                    />
                    <IconButton
                        aria-label="Search"
                        onClick={handleSearch}
                        variant="subtle"
                        size="sm"
                        h="36px"
                    >
                        <IoSearch />
                    </IconButton>

                    <SelectRoot
                        collection={statusOptions}
                        value={[statusFilter]}
                        onValueChange={(details) => {
                            setStatusFilter(details.value[0]);
                            setPage(1);
                        }}
                        width="160px"
                    >
                        <SelectTrigger h="36px">
                            <SelectValueText placeholder="Status" />
                        </SelectTrigger>
                        <SelectContent>
                            {statusOptions.items.map((item) => (
                                <SelectItem key={item.value} item={item}>
                                    {item.label}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </SelectRoot>

                    <SelectRoot
                        collection={sortOptions}
                        value={[sortOrder]}
                        onValueChange={(details) => {
                            setSortOrder(details.value[0]);
                            setPage(1);
                        }}
                        width="180px"
                    >
                        <SelectTrigger h="36px">
                            <SelectValueText placeholder="Sort by" />
                        </SelectTrigger>
                        <SelectContent>
                            {sortOptions.items.map((item) => (
                                <SelectItem key={item.value} item={item}>
                                    {item.label}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </SelectRoot>
                </HStack>

                {/* Right side: Add button */}
                <Box>
                    <JobApplicationDialog onSave={handleCreateApplication}>
                        <Button colorScheme="teal" h="36px" px={6}>
                            <HiViewGridAdd /> Add Application
                        </Button>
                    </JobApplicationDialog>
                </Box>
            </Flex>
        </Flex>
    );
};

export default JobTrackerFilters;
