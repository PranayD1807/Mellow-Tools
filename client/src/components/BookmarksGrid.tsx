import React from "react";
import {
  Flex,
  Text,
  HStack,
  IconButton,
  LinkOverlay,
  LinkBox,
  VStack,
} from "@chakra-ui/react";
import { MdEdit, MdDelete } from "react-icons/md";
import DeleteConfirmationDialog from "./DeleteConfirmationDialog";

import { Bookmark } from "@/models/Bookmark";
import { CreateBookmarkData } from "@/api/modules/bookmarks.api";
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
              <MenuItem value="edit">
                <BookmarkDialog
                  onSave={(values) => handleUpdateBookmark(bookmark.id, values)}
                  initialValues={{
                    label: bookmark.label,
                    note: bookmark.note,
                    url: bookmark.url,
                  }}
                >
                  <HStack>
                    <MdEdit />
                    Edit
                  </HStack>
                </BookmarkDialog>
              </MenuItem>
              <MenuItem value="delete">
                <DeleteConfirmationDialog
                  onDelete={() => handleDeleteBookmark(bookmark.id)}
                  itemName={bookmark.label}
                >
                  <HStack color="red">
                    <MdDelete />
                    Delete
                  </HStack>
                </DeleteConfirmationDialog>
              </MenuItem>
            </MenuContent>
          </MenuRoot>
        </LinkBox>
      ))}
    </Flex>
  );
};

export default BookmarksGrid;
