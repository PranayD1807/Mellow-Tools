import { useState, useEffect } from "react";
import { 
    Box, 
    Text, 
    VStack, 
    HStack, 
    Image, 
    Spinner, 
    SimpleGrid,
    Badge
} from "@chakra-ui/react";
import feedbackApi, { Feedback } from "@/api/modules/feedback.api";
import { toast } from "react-toastify";

export default function FeedbackViewer() {
    const [feedbacks, setFeedbacks] = useState<Feedback[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchFeedbacks = async () => {
            const { data, err } = await feedbackApi.getAll();
            if (err) {
                toast.error(err.message || "Failed to load feedbacks.");
            } else {
                setFeedbacks(data || []);
            }
            setLoading(false);
        };

        fetchFeedbacks();
    }, []);

    if (loading) {
        return (
            <Box display="flex" justifyContent="center" alignItems="center" p={10}>
                <Spinner size="xl" color="blue.500" />
            </Box>
        );
    }

    if (feedbacks.length === 0) {
        return <Text color="gray.400" textAlign="center" mt={10}>No feedbacks received yet.</Text>;
    }

    return (
        <SimpleGrid columns={{ base: 1, md: 2 }} gap={6} p={4}>
            {feedbacks.map(fb => (
                <Box key={fb._id} p={5} bg="gray.800" borderRadius="md" boxShadow="sm" borderWidth="1px" borderColor="gray.700">
                    <HStack justifyContent="space-between" mb={3}>
                        <VStack align="start" gap={0}>
                            <Text fontWeight="bold" color="white">{fb.user?.displayName || "Unknown User"}</Text>
                            <Text fontSize="sm" color="gray.400">{fb.user?.email || "No Email"}</Text>
                        </VStack>
                        <Badge colorPalette="blue">
                            {new Date(fb.createdAt).toLocaleDateString()}
                        </Badge>
                    </HStack>
                    
                    <Text mb={4} color="gray.200" whiteSpace="pre-wrap">
                        {fb.text}
                    </Text>

                    {fb.images && fb.images.length > 0 && (
                        <HStack gap={4} overflowX="auto" py={2}>
                            {fb.images.map((imgUrl, idx) => (
                                <Image 
                                    key={idx} 
                                    src={imgUrl} 
                                    alt={`Feedback Attachment ${idx + 1}`} 
                                    boxSize="150px" 
                                    objectFit="cover" 
                                    borderRadius="md"
                                    cursor="pointer"
                                    onClick={() => window.open(imgUrl, "_blank")}
                                />
                            ))}
                        </HStack>
                    )}
                </Box>
            ))}
        </SimpleGrid>
    );
}
