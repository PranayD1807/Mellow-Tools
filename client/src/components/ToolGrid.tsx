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
import { useNavigate } from "react-router-dom";

interface ToolGridProps {
  tools: Tool[];
}

const ToolGrid: React.FC<ToolGridProps> = ({ tools: tools }) => {
  const navigate = useNavigate();

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
          borderRadius="md"
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
              boxSize="60px"
              objectFit="contain"
            />
            <VStack justifyContent="start" gap={1} w="100%" alignItems="start">
              <HStack gap={6} justifyContent="space-between" w="100%">
                {/* Tool Label */}
                <Text fontSize="xl" fontWeight="bold">
                  {tool.label}
                </Text>

                {/* Tool Endpoint */}
                <IconButton
                  variant="surface"
                  size="2xs"
                  onClick={() => navigate(tool.endpoint)}
                >
                  <FaExternalLinkAlt />
                </IconButton>
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
