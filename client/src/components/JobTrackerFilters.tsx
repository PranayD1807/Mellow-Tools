import {
    Box,
    Flex,
    HStack,
    IconButton,
    Input,
    Text,
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
    startDate: string;
    endDate: string;
    setDateRange: (start: string, end: string) => void;
    sortOrder: string;
    setSortOrder: (value: string) => void;
    statusOptions: ListCollection<{ label: string; value: string }>;
    sortOptions: ListCollection<{ label: string; value: string }>;
    handleCreateApplication: (values: Partial<CreateJobApplicationData>) => Promise<void>;
}

const toLocalISODate = (d: Date) => {
    const pad = (n: number) => String(n).padStart(2, "0");
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
};

const daysAgo = (n: number) => {
    const d = new Date();
    d.setDate(d.getDate() - n);
    return toLocalISODate(d);
};

const presets: { label: string; range: () => [string, string] }[] = [
    { label: "Last 7 days", range: () => [daysAgo(7), toLocalISODate(new Date())] },
    { label: "Last 30 days", range: () => [daysAgo(30), toLocalISODate(new Date())] },
    {
        label: "This month",
        range: () => {
            const now = new Date();
            return [toLocalISODate(new Date(now.getFullYear(), now.getMonth(), 1)), toLocalISODate(now)];
        },
    },
    {
        label: "Last 3 months",
        range: () => {
            const now = new Date();
            return [toLocalISODate(new Date(now.getFullYear(), now.getMonth() - 3, now.getDate())), toLocalISODate(now)];
        },
    },
    { label: "All time", range: () => ["", ""] },
];

const JobTrackerFilters: React.FC<JobTrackerFiltersProps> = ({
    searchInput,
    setSearchInput,
    handleSearch,
    handleKeyPress,
    statusFilter,
    setStatusFilter,
    setPage,
    startDate,
    endDate,
    setDateRange,
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

            <HStack gap={2} flexWrap="wrap">
                <Text fontSize="sm">From</Text>
                <Input
                    type="date"
                    value={startDate}
                    max={endDate || undefined}
                    onChange={(e) => {
                        const v = e.target.value;
                        setDateRange(v, endDate && v > endDate ? v : endDate);
                        setPage(1);
                    }}
                    w="160px"
                    h="36px"
                />
                <Text fontSize="sm">To</Text>
                <Input
                    type="date"
                    value={endDate}
                    min={startDate || undefined}
                    onChange={(e) => {
                        const v = e.target.value;
                        setDateRange(startDate && v && v < startDate ? v : startDate, v);
                        setPage(1);
                    }}
                    w="160px"
                    h="36px"
                />
                {presets.map((p) => (
                    <Button
                        key={p.label}
                        size="xs"
                        variant="outline"
                        onClick={() => {
                            const [s, e] = p.range();
                            setDateRange(s, e);
                            setPage(1);
                        }}
                    >
                        {p.label}
                    </Button>
                ))}
                {(startDate || endDate) && (
                    <Button
                        size="xs"
                        variant="ghost"
                        onClick={() => {
                            setDateRange("", "");
                            setPage(1);
                        }}
                    >
                        Clear
                    </Button>
                )}
            </HStack>
        </Flex>
    );
};

export default JobTrackerFilters;
