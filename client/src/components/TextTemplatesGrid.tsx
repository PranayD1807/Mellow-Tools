import React from "react";
import { Grid, Text, HStack, VStack, Box } from "@chakra-ui/react";
import { useNavigate } from "react-router-dom";
import { TextTemplate } from "@/models/TextTemplate";
import { Button } from "./ui/button";

interface TextTemplatesGridProps {
  templates: TextTemplate[];
}

const TextTemplatesGrid: React.FC<TextTemplatesGridProps> = ({
  templates: templates,
}) => {
  const navigate = useNavigate();

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
      {templates.map((template) => (
        <Box
          border="1px"
          borderRadius="md"
          boxShadow="md"
          p={4}
          key={template.id}
        >
          {/* Icon */}
          <HStack gap={6} justifyContent="space-between" w="100%">
            <VStack justifyContent="start" gap={1} w="100%" alignItems="start">
              {/* Tool Label */}
              <Text fontSize="xl" fontWeight="bold">
                {template.title}
              </Text>

              {/* Tool Description */}
              <Text fontSize="sm">
                {new Date(template.updatedAt).toLocaleDateString("en-US", {
                  day: "2-digit",
                  month: "long",
                  year: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                  hour12: true,
                })}
              </Text>
            </VStack>
            <VStack>
              <Button
                variant="surface"
                size="xs"
                px={4}
                onClick={() =>
                  navigate(`/text-templates/update/${template.id}`)
                }
              >
                Edit
              </Button>
              <Button
                variant="solid"
                size="xs"
                px={4}
                onClick={() => navigate(`/text-templates/${template.id}`)}
              >
                Use
              </Button>
            </VStack>
          </HStack>
        </Box>
      ))}
    </Grid>
  );
};

export default TextTemplatesGrid;
