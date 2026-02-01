import { JobApplication, CreateJobApplicationData } from "@/models/JobApplication";
import {
    Box,
    Flex,
    IconButton,
    HStack,
    Link,
    Text,
    VStack,
    Input,
    createListCollection,
} from "@chakra-ui/react";
import { FiEdit2, FiTrash2, FiExternalLink, FiMapPin, FiCalendar, FiFileText } from "react-icons/fi";
import {
    SelectContent,
    SelectItem,
    SelectRoot,
    SelectTrigger,
    SelectValueText,
    SelectItemText,
} from "@/components/ui/select";
import {
    PopoverRoot,
    PopoverTrigger,
    PopoverContent,
    PopoverBody,
    PopoverArrow,
} from "@/components/ui/popover";

interface JobApplicationRowProps {
    application: JobApplication;
    index: number;
    handleEdit: (application: JobApplication) => void;
    handleDelete: (application: JobApplication) => void;
    handleInlineUpdate: (
        applicationId: string,
        field: keyof CreateJobApplicationData,
        value: string
    ) => Promise<void>;
}

const formatDate = (dateString: string) => {
    if (!dateString) return "-";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
    });
};

export const statusOptions = createListCollection({
    items: [
        { label: "Applied", value: "Applied" },
        { label: "Interviewing", value: "Interviewing" },
        { label: "Offer", value: "Offer" },
        { label: "Rejected", value: "Rejected" },
    ],
});

const JobApplicationRow: React.FC<JobApplicationRowProps> = ({
    application,
    index,
    handleEdit,
    handleDelete,
    handleInlineUpdate,
}) => {
    return (
        <Box
            key={application.id}
            borderWidth="1px"
            borderRadius="md"
            px={{ base: 2, md: 3 }}
            py={{ base: 1.5, md: 2 }}
            bg="bg.panel"
            _hover={{ shadow: "sm" }}
            transition="all 0.2s"
            w="100%"
        >
            {/* Row 1: Main Info */}
            <Flex
                justify="space-between"
                direction={{ base: "column", lg: "row" }}
                align={{ base: "stretch", lg: "center" }}
                gap={{ base: 2, lg: 0 }}
            >
                {/* Left: Serial, Company & Role */}
                <HStack gap={{ base: 2, md: 3 }} flex={1}>
                    <Text fontSize="xs" fontWeight="bold" color="fg.muted" minW="24px">
                        #{index + 1}
                    </Text>
                    <VStack
                        align="start"
                        gap={0}
                        flex={1}
                        display={{ base: "flex", md: "none" }}
                    >
                        <Text fontSize="xs" fontWeight="bold" truncate maxW="150px">
                            {application.company}
                        </Text>
                        <Text fontSize="xs" color="fg.muted" truncate maxW="150px">
                            {application.role}
                        </Text>
                    </VStack>
                    <HStack
                        gap={2}
                        minW="250px"
                        flexWrap="nowrap"
                        flex={1}
                        display={{ base: "none", md: "flex" }}
                        align="center"
                    >
                        <Text fontSize="sm" fontWeight="bold">
                            {application.company}
                        </Text>
                        <Text fontSize="xs" color="fg.muted">•</Text>
                        <Text fontSize="sm" color="fg.muted" truncate maxW="200px">
                            {application.role}
                        </Text>
                    </HStack>
                </HStack>

                {/* Center/Right: Metadata & Actions */}
                <Flex
                    gap={{ base: 2, md: 4 }}
                    wrap="wrap"
                    justify={{ base: "space-between", lg: "flex-end" }}
                    align="center"
                    flex={{ base: "none", lg: 1 }}
                >
                    <HStack gap={1} minW={{ base: "auto", md: "110px" }}>
                        <FiMapPin size={12} color="gray" />
                        <Text fontSize="xs" color="fg.muted" truncate maxW={{ base: "100px", md: "150px" }}>
                            {application.location}
                        </Text>
                    </HStack>
                    <HStack gap={1} minW={{ base: "auto", md: "100px" }}>
                        <FiCalendar size={12} color="gray" />
                        <Text fontSize="xs" color="fg.muted">{formatDate(application.appliedOn)}</Text>
                    </HStack>

                    <Box minW={{ base: "110px", md: "120px" }}>
                        <SelectRoot
                            collection={statusOptions}
                            value={[application.status]}
                            onValueChange={(details) =>
                                handleInlineUpdate(application.id, "status", details.value[0])
                            }
                            size="xs"
                        >
                            <SelectTrigger h="24px">
                                <SelectValueText fontSize="xs" />
                            </SelectTrigger>
                            <SelectContent>
                                {statusOptions.items.map((item) => (
                                    <SelectItem key={item.value} item={item}>
                                        <SelectItemText fontSize="xs">{item.label}</SelectItemText>
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </SelectRoot>
                    </Box>

                    {/* Actions */}
                    <HStack gap={1} ml={{ base: 0, lg: 2 }}>
                        {application.jobLink && (
                            <Link href={application.jobLink} target="_blank" rel="noopener noreferrer">
                                <IconButton
                                    aria-label="Open job link"
                                    size="xs"
                                    variant="ghost"
                                    colorPalette="teal"
                                    h="24px"
                                    w="24px"
                                >
                                    <FiExternalLink size={14} />
                                </IconButton>
                            </Link>
                        )}
                        {application.note && (
                            <PopoverRoot>
                                <PopoverTrigger asChild>
                                    <IconButton
                                        aria-label="View notes"
                                        size="xs"
                                        variant="ghost"
                                        colorPalette="blue"
                                        h="24px"
                                        w="24px"
                                    >
                                        <FiFileText size={14} />
                                    </IconButton>
                                </PopoverTrigger>
                                <PopoverContent maxW="250px">
                                    <PopoverArrow />
                                    <PopoverBody p={2}>
                                        <Text fontSize="xs">{application.note}</Text>
                                    </PopoverBody>
                                </PopoverContent>
                            </PopoverRoot>
                        )}
                        <IconButton
                            aria-label="Edit application"
                            size="xs"
                            variant="ghost"
                            onClick={() => handleEdit(application)}
                            h="24px"
                            w="24px"
                        >
                            <FiEdit2 size={14} />
                        </IconButton>
                        <IconButton
                            aria-label="Delete application"
                            size="xs"
                            variant="ghost"
                            colorPalette="red"
                            onClick={() => handleDelete(application)}
                            h="24px"
                            w="24px"
                        >
                            <FiTrash2 size={14} />
                        </IconButton>
                    </HStack>
                </Flex>
            </Flex>

            {/* Row 2: Interview Info (only when Interviewing) */}
            {application.status === "Interviewing" && (
                <Flex
                    mt={1}
                    pt={2}
                    borderTopWidth="1px"
                    borderTopStyle="dashed"
                    gap={3}
                    direction={{ base: "column", sm: "row" }}
                    align={{ base: "stretch", sm: "center" }}
                >
                    <HStack gap={2}>
                        <Text fontSize="xs" fontWeight="medium" color="fg.muted">Stage:</Text>
                        <Input
                            key={`interview-stage-${application.id}-${application.interviewStage}`}
                            size="xs"
                            h="20px"
                            w={{ base: "full", sm: "120px" }}
                            defaultValue={application.interviewStage || ""}
                            onBlur={(e) => {
                                if (e.target.value !== (application.interviewStage || "")) {
                                    handleInlineUpdate(application.id, "interviewStage", e.target.value);
                                }
                            }}
                            placeholder="Stage"
                            variant="subtle"
                        />
                    </HStack>
                    <HStack gap={2}>
                        <Text fontSize="xs" fontWeight="medium" color="fg.muted">Interview Date:</Text>
                        <Input
                            type="date"
                            size="xs"
                            h="20px"
                            w={{ base: "full", sm: "130px" }}
                            value={application.nextInterviewDate?.split("T")[0] || ""}
                            onKeyDown={(e) => e.preventDefault()}
                            onChange={(e) =>
                                handleInlineUpdate(application.id, "nextInterviewDate", e.target.value)
                            }
                            variant="subtle"
                        />
                    </HStack>
                </Flex>
            )}
        </Box>
    );
};

export default JobApplicationRow;
