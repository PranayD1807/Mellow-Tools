import { useState } from "react";
import {
  Text,
  HStack,
  VStack,
  IconButton,
  Separator,
  Link,
  GridItem,
} from "@chakra-ui/react";
import {
  MdEdit,
  MdDelete,
  MdVisibility,
  MdVisibilityOff,
  MdContentCopy,
} from "react-icons/md";
import DeleteConfirmationDialog from "./DeleteConfirmationDialog";
import NoteDialog from "./NoteDialog";
import CensoredText from "./CensoredText";
import { Note } from "@/models/note";
import { MenuContent, MenuItem, MenuRoot, MenuTrigger } from "./ui/menu";
import { toast } from "react-toastify";
import Linkify from "react-linkify";
import { HiOutlineDotsVertical } from "react-icons/hi";

interface NoteItemProps {
  note: Note;
  handleDeleteNote: (docId: string) => Promise<void>;
  handleUpdateNote: (
    docId: string,
    values: { text: string; title: string }
  ) => Promise<void>;
}

const renderLinks = (href: string, text: string, key: number) => (
  <Link
    key={key}
    href={href}
    color="blue.400"
    target="_blank"
    fontStyle="oblique"
    border="none"
    boxShadow="none"
    _hover={{
      color: "blue.solid",
      transition: "all 0.2s ease-in-out",
      textDecorationColor: "blue.solid",
    }}
  >
    {text}
  </Link>
);

const NoteItem: React.FC<NoteItemProps> = ({
  note,
  handleDeleteNote,
  handleUpdateNote,
}) => {
  const [revealed, setRevealed] = useState(false);

  const copyToClipboard = (content: string) => {
    navigator.clipboard
      .writeText(content)
      .then(() => toast.success("Content copied to clipboard!"))
      .catch(() => toast.error("Failed to copy content."));
  };

  return (
    <GridItem
      minH={0}
      minW={0}
      flex={1}
      border="1px"
      borderRadius="md"
      boxShadow="md"
      p={4}
    >
      <VStack h="200px">
        <HStack
          gap={6}
          w="100%"
          justifyContent="space-between"
          alignItems="start"
        >
          <VStack justifyContent="start" gap={0} alignItems="start">
            <Text fontSize={{ base: "md", lg: "xl" }} fontWeight="bold" as="h3">
              {note.title}
            </Text>

            <Text fontSize={{ base: "2xs", lg: "xs" }}>
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

          {/* Buttons */}
          <HStack>
            <IconButton
              variant="outline"
              size={{ base: "2xs", lg: "xs" }}
              onClick={() => setRevealed((prev) => !prev)}
              aria-label={revealed ? "Hide text" : "Reveal text"}
            >
              {revealed ? <MdVisibilityOff /> : <MdVisibility />}
            </IconButton>

            <MenuRoot>
              <MenuTrigger asChild>
                <IconButton
                  variant="outline"
                  size={{ base: "2xs", lg: "xs" }}
                  aria-label="Open menu"
                >
                  <HiOutlineDotsVertical />
                </IconButton>
              </MenuTrigger>
              <MenuContent>
                <MenuItem
                  value="copy"
                  onClick={() => copyToClipboard(note.text)}
                >
                  <MdContentCopy />
                  Copy
                </MenuItem>

                <NoteDialog
                  onSave={(values) => handleUpdateNote(note.id, values)}
                  initialValues={{ title: note.title, text: note.text }}
                >
                  <MenuItem value="edit">
                    <MdEdit />
                    Edit
                  </MenuItem>
                </NoteDialog>

                <DeleteConfirmationDialog
                  onDelete={() => handleDeleteNote(note.id)}
                  itemName={note.title}
                >
                  <MenuItem value="delete" color="red">
                    <MdDelete />
                    Delete
                  </MenuItem>
                </DeleteConfirmationDialog>
              </MenuContent>
            </MenuRoot>
          </HStack>
        </HStack>

        <Separator />

        <CensoredText revealed={revealed}>
          <Text
            w="100%"
            whiteSpace="pre-line"
            fontSize={{ base: "xs", lg: "sm" }}
          >
            <Linkify componentDecorator={renderLinks}>{note.text}</Linkify>
          </Text>
        </CensoredText>
      </VStack>
    </GridItem>
  );
};

export default NoteItem;
