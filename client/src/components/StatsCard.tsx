import { Box, Text, HStack } from "@chakra-ui/react";
import { ReactNode } from "react";

interface StatsCardProps {
    label: string;
    value: number | string;
    icon: ReactNode;
    color: string;
}

const StatsCard: React.FC<StatsCardProps> = ({ label, value, icon, color }) => {
    return (
        <Box
            px={3}
            py={2}
            borderRadius="md"
            borderWidth="1px"
            bg="bg.panel"
            boxShadow="xs"
            flex="1"
            minW="120px"
        >
            <HStack gap={3} align="center" justify="space-between">
                <HStack gap={2}>
                    <Box color={color}>
                        {icon}
                    </Box>
                    <Text fontSize="xs" color="fg.muted" fontWeight="medium" whiteSpace="nowrap">
                        {label}
                    </Text>
                </HStack>
                <Text fontSize="md" fontWeight="bold">
                    {value}
                </Text>
            </HStack>
        </Box>
    );
};

export default StatsCard;
