import bookmarkApi, { CreateBookmarkData } from "@/api/modules/bookmarks.api";
import BookmarkDialog from "@/components/BookmarkDialog";
import BookmarksGrid from "@/components/BookmarksGrid";
import { Button } from "@/components/ui/button";
import { Bookmark } from "@/models/Bookmark";
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
import { Helmet } from "react-helmet-async";
import { HiViewGridAdd } from "react-icons/hi";
import { IoSearch } from "react-icons/io5";
import { toast } from "react-toastify";

const Bookmarks = () => {
  const [bookmarks, setBookmarks] = useState<Bookmark[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchTerm, setSearchTerm] = useState<string>("");

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  const fetchLogoUrl = async (url: string): Promise<string | null> => {
    try {
      const domain = new URL(url).hostname;
      return `https://logo.clearbit.com/${domain}`;
    } catch (error) {
      console.error("Error fetching logo URL:", error);
      return null;
    }
  };

  const fetchBookmarks = async (query: string = "") => {
    setLoading(true);
    try {
      const res = await bookmarkApi.getAll(query);

      if (res.status === "error") {
        toast.error(res.err?.message || "Something went wrong");
      } else if (res.status === "success" && res.data) {
        setBookmarks(res.data);
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
      const res = await bookmarkApi.delete(docId);
      if (res.err) {
        toast.error(res.err.message);
      } else {
        setBookmarks((prevItems) =>
          prevItems.filter((item) => item.id !== docId)
        );
        toast.success("Template deleted successfully!");
      }
    } catch (error) {
      console.error("Failed to delete contact", error);
    }
  };

  const handleNoteSearch = () => {
    fetchBookmarks(searchTerm);
  };

  const handleCreateBookmark = async (values: CreateBookmarkData) => {
    try {
      const logoUrl = await fetchLogoUrl(values.url);
      const dataWithLogo = values;

      if (logoUrl) {
        dataWithLogo.logoUrl = logoUrl;
      }

      const res = await bookmarkApi.create(dataWithLogo);
      if (res.status === "error") {
        toast.error(res.err?.message || "Something went wrong");
      } else if (res.data) {
        setBookmarks((prevItems) => [...prevItems, res.data!]);
        toast.success("Bookmark added successfully!");
      }
    } catch (error) {
      console.error("Error adding bookmark:", error);
      toast.error("Something went wrong");
    }
  };

  const handleUpdate = async (docId: string, values: CreateBookmarkData) => {
    try {
      const logoUrl = await fetchLogoUrl(values.url);
      const dataWithLogo = values;

      if (logoUrl) {
        dataWithLogo.logoUrl = logoUrl;
      }

      const res = await bookmarkApi.update(docId, dataWithLogo);
      if (res.status === "error") {
        toast.error(res.err?.message || "Something went wrong");
      } else if (res.data) {
        toast.success("Note updated successfully!");
        setBookmarks((prevItems) =>
          prevItems.map((note) => (note.id === docId ? res.data || note : note))
        );
      }
    } catch (error) {
      console.error("Error updating note:", error);
      toast.error("Something went wrong");
    }
  };

  useEffect(() => {
    if (searchTerm === "") {
      fetchBookmarks();
    }
  }, [searchTerm]);

  return (
    <>
      <Helmet>
        <title>Bookmarks - Save and Organize Your Favorite Links</title>
        <meta
          name="description"
          content="Save, update, and manage your favorite links easily. Keep your bookmarks organized and accessible in one place."
        />
        <meta
          name="keywords"
          content="bookmarks, save links, organize bookmarks, favorite links, manage bookmarks"
        />
        <meta
          property="og:title"
          content="Bookmarks - Save and Organize Your Favorite Links"
        />
        <meta
          property="og:description"
          content="Save, update, and manage your favorite links easily."
        />
        <meta property="og:image" content="/og-image.png" />
        <meta name="robots" content="index, follow" />
      </Helmet>

      <Flex
        direction="column"
        p={4}
        alignItems="center"
        gap={6}
        w="100%"
        mt={4}
      >
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
          {/* Add Bookmark Button */}
          <Box width={{ base: "100%", md: "30%" }} ml={{ base: 0, md: 4 }}>
            <BookmarkDialog
              children={
                <Button colorScheme="teal" width="100%">
                  <HiViewGridAdd /> Add Bookmark
                </Button>
              }
              onSave={handleCreateBookmark}
            />
          </Box>
        </Flex>
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
        {!loading && (
          <BookmarksGrid
            handleUpdateBookmark={handleUpdate}
            bookmarks={bookmarks}
            handleDeleteBookmark={handleDelete}
          />
        )}
      </Flex>
    </>
  );
};

export default Bookmarks;
