import React from "react";
import { Grid, Text, HStack, VStack, Box } from "@chakra-ui/react";
import { Link } from "react-router-dom";
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
  const [deletingTemplate, setDeletingTemplate] = React.useState<TextTemplate | null>(null);

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
          role="article"
          aria-labelledby={`template-${template.id}`}
        >
          <VStack
            gap={6}
            justifyContent="space-between"
            w="100%"
            alignItems="start"
          >
            <VStack justifyContent="start" gap={1} w="100%" alignItems="start">
              <Text
                id={`template-${template.id}`}
                fontSize="xl"
                fontWeight="bold"
                as="h2"
              >
                {template.title}
              </Text>

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
              <Link to={`/text-templates/update/${template.id}`}>
                <Button
                  variant="outline"
                  size="sm"
                  aria-label={`Edit template ${template.title}`}
                >
                  <MdEdit />
                  Edit
                </Button>
              </Link>

              <Button
                variant="outline"
                size="sm"
                color="red"
                onClick={() => setDeletingTemplate(template)}
                aria-label={`Delete template ${template.title}`}
              >
                <MdDelete color="red" />
                Delete
              </Button>

              <Link to={`/text-templates/${template.id}`}>
                <Button
                  variant="solid"
                  size="xs"
                  flex={1}
                  maxW="200px"
                  px={4}
                  aria-label={`Use template ${template.title}`}
                >
                  Use
                </Button>
              </Link>
            </HStack>
          </VStack>
        </Box>
      ))}

      {/* Delete Dialog */}
      {deletingTemplate && (
        <DeleteConfirmationDialog
          open={!!deletingTemplate}
          onOpenChange={(isOpen) => !isOpen && setDeletingTemplate(null)}
          onDelete={() => handleDeleteTemplate(deletingTemplate.id)}
          itemName={deletingTemplate.title}
        />
      )}
    </Grid>
  );
};

export default TextTemplatesGrid;
