import noteApi from "@/api/modules/note.api";
import NoItems from "@/components/NoItems";
import NoteDialog from "@/components/NoteDialog";
import NotesGrid from "@/components/NotesGrid";
import { Button } from "@/components/ui/button";
import { Note } from "@/models/note";
import {
  Box,
  Flex,
  IconButton,
  Input,
  Spinner,
  Text,
  VStack,
} from "@chakra-ui/react";
import { useEffect, useState } from "react";
import SEO from "@/components/SEO";
import { HiViewGridAdd } from "react-icons/hi";
import { IoSearch } from "react-icons/io5";
import { toast } from "react-toastify";
import { useSelector } from "react-redux";
import { RootState } from "@/store/store";

const Notes = () => {
  const isLoggedIn = useSelector((state: RootState) => state.user.isLoggedIn);
  const [notes, setNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchTerm, setSearchTerm] = useState<string>("");

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  const fetchNotes = async (query: string = "") => {
    if (!isLoggedIn) {
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const res = await noteApi.getAll(query);

      if (res.status === "error") {
        toast.error(res.err?.message || "Something went wrong");
      } else if (res.status === "success" && res.data) {
        setNotes(res.data);
      }
    } catch (error) {
      console.log(error);
      toast.error("Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (docId: string) => {
    try {
      const res = await noteApi.delete(docId);
      if (res.err) {
        toast.error(res.err.message);
      } else {
        setNotes((prevItems) => prevItems.filter((item) => item.id !== docId));
        toast.success("Template deleted successfully!");
      }
    } catch (error) {
      console.error("Failed to delete contact", error);
    }
  };

  const handleNoteSearch = () => {
    fetchNotes(searchTerm);
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleNoteSearch();
    }
  };

  const handleCreateNote = async (values: { title: string; text: string }) => {
    try {
      const res = await noteApi.create(values);
      if (res.status === "error") {
        // Handle error response
        toast.error(res.err?.message || "Something went wrong");
      } else if (res.data) {
        setNotes((prevItems) => [res.data!, ...prevItems]);
        toast.success("Note added successfully!");
      }
    } catch (error) {
      console.error("Error adding template:", error);
      toast.error("Something went wrong");
    }
  };

  const handleUpdateNote = async (
    docId: string,
    values: { text: string; title: string }
  ) => {
    try {
      const res = await noteApi.update(docId, values); // Ensure `docId` is valid
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

  useEffect(() => {
    if (isLoggedIn) {
      fetchNotes();
    } else {
      setLoading(false);
    }
  }, [isLoggedIn]);

  return (
    <>
      <SEO
        title="Notes"
        description="Create, update, search, and delete notes easily. Organize your thoughts and ideas in one place."
        keywords="notes, note taking, create note, update note, delete note, organize notes"
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
                value={searchTerm}
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
            {/* Add Contact Button */}
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
        {/* Contact Grid */}
        {loading && (
          <Flex justify="center" align="center" height="60vh">
            <VStack gap={6}>
              <Spinner size="xl" borderWidth="4px" />
              <Text textStyle="2xl" fontWeight="bold">
                Loading...
              </Text>
            </VStack>
          </Flex>
        )}
        {!loading && notes.length != 0 && (
          <NotesGrid
            handleUpdateNote={handleUpdateNote}
            notes={notes}
            handleDeleteNote={handleDelete}
          />
        )}
        {!loading && notes.length === 0 && <NoItems text="notes" />}
      </Flex>
    </>
  );
};

export default Notes;
