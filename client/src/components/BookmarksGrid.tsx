import React from "react";
import {
  Flex,
  Text,
  IconButton,
  LinkOverlay,
  LinkBox,
  VStack,
} from "@chakra-ui/react";
import { MdEdit, MdDelete } from "react-icons/md";
import DeleteConfirmationDialog from "./DeleteConfirmationDialog";

import { Bookmark, CreateBookmarkData } from "@/models/Bookmark";
import BookmarkDialog from "./BookmarkDialog";
import { MenuContent, MenuItem, MenuRoot, MenuTrigger } from "./ui/menu";
import { HiOutlineDotsVertical } from "react-icons/hi";
import { Avatar } from "./ui/avatar";
import { Tooltip } from "./ui/tooltip";

interface BookmarksGridProps {
  bookmarks: Bookmark[];
  handleDeleteBookmark: (docId: string) => Promise<void>;
  handleUpdateBookmark: (
    docId: string,
    values: CreateBookmarkData
  ) => Promise<void>;
}

const BookmarksGrid: React.FC<BookmarksGridProps> = ({
  bookmarks,
  handleDeleteBookmark,
  handleUpdateBookmark,
}) => {
  const [editingBookmark, setEditingBookmark] = React.useState<Bookmark | null>(null);
  const [deletingBookmark, setDeletingBookmark] = React.useState<Bookmark | null>(null);

  return (
    <Flex
      wrap="wrap"
      gap={5}
      p={4}
      justify={{ base: "center", md: "start" }}
      w="full"
    >
      {bookmarks.map((bookmark) => (
        <LinkBox
          as={Flex}
          key={bookmark.id}
          border="1px"
          aspectRatio="1"
          borderRadius="md"
          boxShadow="md"
          p={2}
          _hover={{ "& > button": { opacity: 1 } }}
        >
          <Tooltip content={bookmark.note} disabled={!bookmark.note}>
            <VStack
              gap={{ base: 2, md: 2 }}
              w="full"
              alignItems="center"
              justifyContent="center"
            >
              <Avatar
                name={bookmark.label}
                size={{ base: "xl", md: "2xl" }}
                src={bookmark.logoUrl}
              />

              <LinkOverlay href={bookmark.url} target="_blank">
                <Text
                  fontSize={{ base: "xs", lg: "sm" }}
                  overflow="hidden"
                  textOverflow="ellipsis"
                  w={{ base: "90px", md: "120px" }}
                  fontWeight="semibold"
                  textAlign="center"
                  truncate
                >
                  {bookmark.label}
                </Text>
              </LinkOverlay>
            </VStack>
          </Tooltip>

          {/* Right: Menu */}
          <MenuRoot>
            <MenuTrigger asChild>
              <IconButton
                variant="ghost"
                size={{ base: "2xs", lg: "xs" }}
                aria-label="Open menu"
                pos="absolute"
                right="0px"
                top="0px"
                m="4px"
                opacity={0}
                transition="opacity 0.2s ease-in-out"
              >
                <HiOutlineDotsVertical />
              </IconButton>
            </MenuTrigger>
            <MenuContent>
              <MenuItem value="edit" onSelect={() => setEditingBookmark(bookmark)}>
                <MdEdit />
                Edit
              </MenuItem>
              <MenuItem
                value="delete"
                color="red"
                onSelect={() => setDeletingBookmark(bookmark)}
              >
                <MdDelete />
                Delete
              </MenuItem>
            </MenuContent>
          </MenuRoot>
        </LinkBox>
      ))}

      {/* Edit Dialog */}
      {editingBookmark && (
        <BookmarkDialog
          open={!!editingBookmark}
          onOpenChange={(isOpen) => !isOpen && setEditingBookmark(null)}
          onSave={(values) => handleUpdateBookmark(editingBookmark.id, values)}
          initialValues={{
            label: editingBookmark.label,
            note: editingBookmark.note,
            url: editingBookmark.url,
          }}
          title="Edit Bookmark"
        />
      )}

      {/* Delete Dialog */}
      {deletingBookmark && (
        <DeleteConfirmationDialog
          open={!!deletingBookmark}
          onOpenChange={(isOpen) => !isOpen && setDeletingBookmark(null)}
          onDelete={() => handleDeleteBookmark(deletingBookmark.id)}
          itemName={deletingBookmark.label}
        />
      )}
    </Flex>
  );
};

export default BookmarksGrid;
