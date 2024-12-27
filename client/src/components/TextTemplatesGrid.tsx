import React from "react";
import { Grid, Text, HStack, VStack, Box } from "@chakra-ui/react";
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
      w="100%"
      templateColumns={{
        base: "repeat(1, 1fr)",
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
          w="100%"
          key={template.id}
        >
          <VStack
            gap={6}
            justifyContent="space-between"
            w="100%"
            alignItems="start"
          >
            {/* Icon */}
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

            <HStack w="100%">
              <Button
                variant="outline"
                size="sm"
                onClick={() =>
                  navigate(`/text-templates/update/${template.id}`)
                }
              >
                <MdEdit />
                Edit
              </Button>
              <DeleteConfirmationDialog
                onDelete={() => handleDeleteTemplate(template.id)}
                itemName={template.title}
                children={
                  <Button variant="outline" size="sm" color="red">
                    <MdDelete color="red" />
                    Delete
                  </Button>
                }
              />
              <Button
                variant="solid"
                size="xs"
                flex={1}
                maxW="200px"
                px={4}
                onClick={() => navigate(`/text-templates/${template.id}`)}
              >
                Use
              </Button>
            </HStack>
          </VStack>
        </Box>
      ))}
    </Grid>
  );
};

export default TextTemplatesGrid;
