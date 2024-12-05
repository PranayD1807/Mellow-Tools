import React from "react";
import {
  Grid,
  Image,
  Text,
  HStack,
  VStack,
  IconButton,
  Box,
} from "@chakra-ui/react";
import { FaExternalLinkAlt } from "react-icons/fa";
import { Tool } from "@/models/Tool";

interface ToolGridProps {
  tools: Tool[];
}

const ToolGrid: React.FC<ToolGridProps> = ({ tools: tools }) => {
  return (
    <Grid
      templateColumns={{
        base: "repeat(1, 1fr)",
        sm: "repeat(2, 1fr)",
        md: "repeat(2, 1fr)",
        lg: "repeat(4, 1fr)",
      }}
      gap={5}
      p={4}
    >
      {tools.map((tool) => (
        <Box border="1px" borderRadius="md" boxShadow="md" p={4} pr={6}>
          <HStack gap={4}>
            {/* Icon */}
            <Image
              src={tool.icon}
              alt={tool.label}
              boxSize="60px"
              objectFit="contain"
            />
            <VStack justifyContent="start" gap={1}>
              <HStack key={tool.id} gap={6}>
                {/* Tool Label */}
                <Text fontSize="xl" fontWeight="bold">
                  {tool.label}
                </Text>

                {/* Tool Endpoint */}
                <IconButton variant="surface" size="2xs">
                  <FaExternalLinkAlt />
                </IconButton>
              </HStack>
              {/* Tool Description */}
              <Text fontSize="sm" color="gray.600">
                {tool.description}{" "}
              </Text>
            </VStack>
          </HStack>
        </Box>
      ))}
    </Grid>
  );
};

export default ToolGrid;
