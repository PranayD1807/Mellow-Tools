import React from "react";
import {
  Grid,
  Text,
  HStack,
  VStack,
  IconButton,
  Separator,
  GridItem,
} from "@chakra-ui/react";
import { MdEdit, MdDelete } from "react-icons/md";
import DeleteConfirmationDialog from "./DeleteConfirmationDialog";
import { Note } from "@/models/note";
import NoteDialog from "./NoteDialog";
import { MdContentCopy } from "react-icons/md";
import { toast } from "react-toastify";

interface NotesGridProps {
  notes: Note[];
  handleDeleteNote: (docId: string) => Promise<void>;
  handleUpdateNote: (
    docId: string,
    values: { text: string; title: string }
  ) => Promise<void>;
}

const NotesGrid: React.FC<NotesGridProps> = ({
  notes: notes,
  handleDeleteNote: handleDeleteNote,
  handleUpdateNote: handleUpdateNote,
}) => {
  const copyToClipboard = (content: string) => {
    const clipboardItem = new ClipboardItem({
      "text/plain": new Blob([content], { type: "text/plain" }),
    });

    navigator.clipboard
      .write([clipboardItem])
      .then(() => {
        toast.success("Content copied to clipboard!");
      })
      .catch((error) => {
        console.error("Error copying to clipboard:", error);
        toast.error("Failed to copy formatted content.");
      });
  };

  return (
    <Grid
      w="100%"
      templateColumns={{
        base: "repeat(1, 1fr)",
        md: "repeat(2, 1fr)",
        xl: "repeat(3, 1fr)",
      }}
      gap={5}
      p={4}
    >
      {notes.map((note) => (
        <GridItem
          minH={0}
          minW={0}
          flex={1}
          border="1px"
          borderRadius="md"
          boxShadow="md"
          p={4}
          key={note.id}
        >
          <VStack h="200px">
            <HStack
              gap={6}
              w="100%"
              justifyContent="space-between"
              alignItems="start"
            >
              <VStack justifyContent="start" gap={0} alignItems="start">
                {/* Tool Label */}
                <Text fontSize="xl" fontWeight="bold">
                  {note.title}
                </Text>

                {/* Tool Description */}
                <Text fontSize="xs">
                  {new Date(note.updatedAt).toLocaleDateString("en-US", {
                    day: "2-digit",
                    month: "long",
                    year: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                    hour12: true,
                  })}
                </Text>
              </VStack>

              <HStack>
                <IconButton
                  variant="outline"
                  size="xs"
                  onClick={() => copyToClipboard(note.text)}
                >
                  <MdContentCopy />
                </IconButton>
                <NoteDialog
                  onSave={(values) => handleUpdateNote(note.id, values)}
                  initialValues={{ title: note.title, text: note.text }}
                  children={
                    <IconButton variant="outline" size="xs">
                      <MdEdit />
                    </IconButton>
                  }
                />

                <DeleteConfirmationDialog
                  onDelete={() => handleDeleteNote(note.id)}
                  itemName={note.title}
                  children={
                    <IconButton variant="outline" size="xs" color="red">
                      <MdDelete color="red" />
                    </IconButton>
                  }
                ></DeleteConfirmationDialog>
              </HStack>
            </HStack>
            <Separator />
            <Text
              w="100%"
              textOverflow="ellipsis"
              whiteSpace="pre-line"
              lineClamp={10}
              fontSize="sm"
              overflowY="scroll"
            >
              {note.text}
            </Text>
          </VStack>
        </GridItem>
      ))}
    </Grid>
  );
};

export default NotesGrid;
