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
import { Link } from "react-router-dom";

interface ToolGridProps {
  tools: Tool[];
}

const ToolGrid: React.FC<ToolGridProps> = ({ tools: tools }) => {
  return (
    <Grid
      w="100%"
      templateColumns={{
        base: "repeat(1, 1fr)",
        md: "repeat(2, 1fr)",
        xl: "repeat(4, 1fr)",
        lg: "repeat(3, 1fr)",
      }}
      gap={5}
      p={4}
    >
      {tools.map((tool) => (
        <Box
          border="1px"
          borderRadius="xl"
          boxShadow="md"
          p={4}
          pr={6}
          key={tool.id}
        >
          <HStack gap={4} alignItems="center">
            {/* Icon */}
            <Image
              src={tool.icon}
              alt={tool.label}
              boxSize="80px"
              objectFit="contain"
              borderRadius="xl"
            />
            <VStack justifyContent="start" gap={1} w="100%" alignItems="start">
              <HStack gap={6} justifyContent="space-between" w="100%">
                {/* Tool Label */}
                <Text fontSize="xl" fontWeight="bold">
                  {tool.label}
                </Text>

                {/* Tool Endpoint */}
                {/* Update IconButton to use a Link */}
                <Link to={tool.endpoint}>
                  <IconButton variant="surface" size="2xs" aria-label="Visit">
                    <FaExternalLinkAlt />
                  </IconButton>
                </Link>
              </HStack>
              {/* Tool Description */}
              <Text fontSize="sm">{tool.description}</Text>
            </VStack>
          </HStack>
        </Box>
      ))}
    </Grid>
  );
};

export default ToolGrid;
