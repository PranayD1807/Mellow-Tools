import React from "react";
import {
  Grid,
  Image,
  Text,
  HStack,
  VStack,
  IconButton,
  LinkBox,
  LinkOverlay,
} from "@chakra-ui/react";
import { FaExternalLinkAlt } from "react-icons/fa";
import { Tool } from "@/models/Tool";

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
        <LinkBox
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
              boxSize={{ base: "60px", md: "80px" }}
              objectFit="contain"
              borderRadius="xl"
            />
            <VStack justifyContent="start" gap={1} w="100%" alignItems="start">
              <HStack gap={6} justifyContent="space-between" w="100%">
                {/* Tool Label */}
                <Text fontSize={{ base: "md", md: "xl" }} fontWeight="bold">
                  {tool.label}
                </Text>

                {/* Tool Endpoint */}
                {/* Update IconButton to use a Link */}
                <LinkOverlay href={tool.endpoint}>
                  <IconButton variant="surface" size="2xs" aria-label="Visit">
                    <FaExternalLinkAlt />
                  </IconButton>
                </LinkOverlay>
              </HStack>
              {/* Tool Description */}
              <Text fontSize={{ base: "xs", md: "sm" }}>
                {tool.description}
              </Text>
            </VStack>
          </HStack>
        </LinkBox>
      ))}
    </Grid>
  );
};

export default ToolGrid;
