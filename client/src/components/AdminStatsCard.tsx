import { Box, Text, HStack } from "@chakra-ui/react";
import { ReactNode } from "react";

interface AdminStatsCardProps {
    label: string;
    value: number | string;
    icon: ReactNode;
    color: string;
}

const AdminStatsCard: React.FC<AdminStatsCardProps> = ({ label, value, icon, color }) => {
    return (
        <Box
            p={6}
            borderRadius="2xl"
            borderWidth="1px"
            borderColor="border.subtle"
            bg="bg.panel"
            boxShadow="sm"
            transition="all 0.3s ease"
            _hover={{ transform: "translateY(-4px)", boxShadow: "xl", borderColor: color }}
            position="relative"
            overflow="hidden"
        >
            {/* Subtle aesthetic glow at the top right */}
            <Box
                position="absolute"
                top="-20px"
                right="-20px"
                w="80px"
                h="80px"
                bg={color}
                opacity={0.15}
                borderRadius="full"
                filter="blur(20px)"
            />

            <HStack justify="space-between" align="center" mb={4}>
                <Text fontSize="xs" color="fg.muted" fontWeight="bold" textTransform="uppercase" letterSpacing="widest">
                    {label}
                </Text>
                <Box color={color} fontSize="xl">
                    {icon}
                </Box>
            </HStack>
            <Text fontSize="4xl" fontWeight="black" color="fg.default" lineHeight="1">
                {value}
            </Text>
        </Box>
    );
};

export default AdminStatsCard;
