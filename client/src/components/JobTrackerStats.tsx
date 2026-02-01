import { SimpleGrid } from "@chakra-ui/react";
import { FiBriefcase, FiCheckCircle, FiMessageCircle, FiXCircle } from "react-icons/fi";
import StatsCard from "./StatsCard";

interface JobTrackerStatsProps {
    stats: {
        total: number;
        Applied: number;
        Interviewing: number;
        Offer: number;
        Rejected: number;
    };
}

const JobTrackerStats: React.FC<JobTrackerStatsProps> = ({ stats }) => {
    return (
        <SimpleGrid columns={{ base: 2, md: 5 }} gap={2} w={{ base: "95%", lg: "90%" }}>
            <StatsCard
                label="Total"
                value={stats.total}
                icon={<FiBriefcase size={16} />}
                color="blue.500"
            />
            <StatsCard
                label="Applied"
                value={stats.Applied}
                icon={<FiBriefcase size={16} />}
                color="gray.500"
            />
            <StatsCard
                label="Interviewing"
                value={stats.Interviewing}
                icon={<FiMessageCircle size={16} />}
                color="yellow.500"
            />
            <StatsCard
                label="Offers"
                value={stats.Offer}
                icon={<FiCheckCircle size={16} />}
                color="green.500"
            />
            <StatsCard
                label="Rejected"
                value={stats.Rejected}
                icon={<FiXCircle size={16} />}
                color="red.500"
            />
        </SimpleGrid>
    );
};

export default JobTrackerStats;
