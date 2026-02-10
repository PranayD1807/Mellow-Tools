import noteApi from "@/api/modules/note.api";
import { useIterativeSearch } from "@/hooks/useIterativeSearch";
import NoItems from "@/components/NoItems";
import NoteDialog from "@/components/NoteDialog";
import NotesGrid from "@/components/NotesGrid";
import SearchingLoader from "@/components/SearchingLoader";
import { Button } from "@/components/ui/button";
import { TextNote, CreateTextNoteData } from "@/models/TextNote";
import {
  Box,
  Flex,
  IconButton,
  Input,
  Text,
  VStack,
} from "@chakra-ui/react";
import { useState, useCallback, useEffect } from "react";
import SEO from "@/components/SEO";
import { HiViewGridAdd } from "react-icons/hi";
import { IoSearch } from "react-icons/io5";
import { toast } from "react-toastify";
import { useSelector } from "react-redux";
import { RootState } from "@/store/store";

const Notes = () => {
  const isLoggedIn = useSelector((state: RootState) => state.user.isLoggedIn);
  const [searchInput, setSearchInput] = useState<string>("");
  const [searchTerm, setSearchTerm] = useState<string>("");

  const fetchNotesCallback = useCallback((page: number, limit: number, signal?: AbortSignal) => {
    return noteApi.getAll({ page, limit }, signal);
  }, []);

  const filterFunction = useCallback((note: TextNote, query: string) => {
    const lowerQuery = query.toLowerCase();
    return !!(
      (note.title && note.title.toLowerCase().includes(lowerQuery)) ||
      (note.text && note.text.toLowerCase().includes(lowerQuery))
    );
  }, []);

  const {
    items: notes,
    setItems: setNotes,
    loading,
    isSearching,
    currentPage,
    hasMore,
    hasPrev,
    nextPage,
    prevPage,
  } = useIterativeSearch<TextNote>({
    fetchFunction: fetchNotesCallback,
    searchQuery: searchTerm,
    filterFunction,
    pageSize: 20,
    enabled: isLoggedIn,
  });

  useEffect(() => {
    if (!isLoggedIn) {
      setNotes([]);
      setSearchInput("");
      setSearchTerm("");
    }
  }, [isLoggedIn, setNotes]);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchInput(e.target.value);
  };

  const handleCreateNote = async (
    data: Partial<CreateTextNoteData>
  ): Promise<void> => {
    try {
      const res = await noteApi.create(data);
      if (res.status === "error") {
        toast.error(res.err?.message || "Something went wrong");
      } else if (res.data) {
        setNotes((prevItems) => [res.data!, ...prevItems]);
        toast.success("Note added successfully!");
      }
    } catch (error) {
      console.error("Error adding note:", error);
      toast.error("Something went wrong");
    }
  };

  const handleUpdate = async (docId: string, values: Partial<CreateTextNoteData>) => {
    try {
      const res = await noteApi.update(docId, values);
      if (res.status === "error") {
        toast.error(res.err?.message || "Something went wrong");
      } else if (res.data) {
        toast.success("Note updated successfully!");
        setNotes((prevItems) =>
          prevItems.map((note) => (note.id === docId ? res.data || note : note))
        );
      }
    } catch (error) {
      console.error("Error updating note:", error);
      toast.error("Something went wrong");
    }
  };

  const handleDelete = async (docId: string) => {
    try {
      const res = await noteApi.delete(docId);
      if (res.err) {
        toast.error(res.err.message);
      } else {
        setNotes((prevItems) => prevItems.filter((item) => item.id !== docId));
        toast.success("Text Note deleted successfully!");
      }
    } catch (error) {
      console.error("Failed to delete note", error);
    }
  };

  const handleNoteSearch = () => {
    setSearchTerm(searchInput);
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleNoteSearch();
    }
  };

  return (
    <>
      <SEO
        title="Notes"
        description="Create, update, and manage your notes effortlessly. Keep your ideas and important information organized in one place."
        keywords="notes, create notes, update notes, manage notes, organize notes"
      />

      <Flex
        direction="column"
        p={4}
        alignItems="center"
        gap={6}
        w="100%"
        mt={4}
      >
        {isLoggedIn && (
          <Flex
            direction={{ base: "column", md: "row" }}
            justify="space-between"
            align="center"
            mb={4}
            width={{ base: "85%", sm: "70%", md: "60%" }}
            gapY={2}
          >
            {/* Search Input */}
            <Flex
              direction="row"
              width={{ base: "100%", md: "70%" }}
              align="center"
              mb={{ base: 4, md: 0 }}
            >
              <Input
                placeholder="Search..."
                value={searchInput}
                onChange={handleSearchChange}
                onKeyDown={handleKeyPress}
                flex="1"
                mr={4}
              />
              <IconButton
                aria-label="Search"
                onClick={handleNoteSearch}
                variant="subtle"
                width="auto"
              >
                <IoSearch />
              </IconButton>
            </Flex>
            {/* Add Note Button */}
            <Box width={{ base: "100%", md: "30%" }} ml={{ base: 0, md: 4 }}>
              <NoteDialog
                children={
                  <Button colorScheme="teal" width="100%">
                    <HiViewGridAdd /> Add Note
                  </Button>
                }
                onSave={handleCreateNote}
              />
            </Box>
          </Flex>
        )}
        {/* Notes Grid */}
        {loading && notes.length === 0 && (
          <Flex justify="center" align="center" height="60vh">
            <VStack gap={6}>
              <SearchingLoader isSearching={isSearching} text="Loading notes..." />
            </VStack>
          </Flex>
        )}

        {!loading && notes.length === 0 && !isSearching && <NoItems text="notes" />}

        {(notes.length > 0 || isSearching) && (
          <>
            <NotesGrid
              handleUpdateNote={handleUpdate}
              notes={notes}
              handleDeleteNote={handleDelete}
            />
            <SearchingLoader isSearching={isSearching} />

            {/* Pagination Controls */}
            {isLoggedIn && notes.length > 0 && !isSearching && (
              <Flex justify="center" align="center" gap={4} py={6}>
                <Button
                  onClick={prevPage}
                  disabled={!hasPrev}
                  variant="outline"
                  size="sm"
                >
                  Previous
                </Button>
                <Text fontSize="sm" fontWeight="medium">
                  Page {currentPage + 1}
                </Text>
                <Button
                  onClick={nextPage}
                  disabled={!hasMore}
                  variant="outline"
                  size="sm"
                  loading={loading}
                >
                  Next
                </Button>
              </Flex>
            )}
          </>
        )}
      </Flex>
    </>
  );
};

export default Notes;
