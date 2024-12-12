import React from "react";
import { Grid, Text, HStack, VStack, Box, IconButton } from "@chakra-ui/react";
import { useNavigate } from "react-router-dom";
import { TextTemplate } from "@/models/TextTemplate";
import { Button } from "./ui/button";
import { MdEdit, MdDelete } from "react-icons/md";
import DeleteConfirmationDialog from "./DeleteConfirmationDialog";

interface TextTemplatesGridProps {
  templates: TextTemplate[];
  handleDeleteTemplate: (contactId: string) => Promise<void>;
}

const TextTemplatesGrid: React.FC<TextTemplatesGridProps> = ({
  templates: templates,
  handleDeleteTemplate: handleDeleteTemplate,
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
              <HStack>
                <IconButton
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    navigate(`/text-templates/update/${template.id}`)
                  }
                >
                  <MdEdit />
                </IconButton>
                <DeleteConfirmationDialog
                  onDelete={() => handleDeleteTemplate(template.id)}
                  itemName={template.title}
                  children={
                    <IconButton variant="outline" size="sm" color="red">
                      <MdDelete color="red" />
                    </IconButton>
                  }
                ></DeleteConfirmationDialog>
              </HStack>

              <Button
                variant="solid"
                size="xs"
                w="100%"
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
