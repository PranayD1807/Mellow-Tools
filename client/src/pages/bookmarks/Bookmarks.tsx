import bookmarkApi from "@/api/modules/bookmarks.api";
import { useIterativeSearch } from "@/hooks/useIterativeSearch";
import BookmarkDialog from "@/components/BookmarkDialog";
import BookmarksGrid from "@/components/BookmarksGrid";
import SearchingLoader from "@/components/SearchingLoader";
import NoItems from "@/components/NoItems";
import { Button } from "@/components/ui/button";
import { Bookmark, CreateBookmarkData } from "@/models/Bookmark";
import {
  Box,
  Flex,
  IconButton,
  Input,
  Text,
  VStack,
} from "@chakra-ui/react";
import { useState, useCallback } from "react";
import SEO from "@/components/SEO";
import { HiViewGridAdd } from "react-icons/hi";
import { IoSearch } from "react-icons/io5";
import { toast } from "react-toastify";
import { useSelector } from "react-redux";
import { RootState } from "@/store/store";

const Bookmarks = () => {
  const isLoggedIn = useSelector((state: RootState) => state.user.isLoggedIn);
  const [searchInput, setSearchInput] = useState<string>("");
  const [searchTerm, setSearchTerm] = useState<string>("");
  const logoKey = import.meta.env.VITE_LOGO_DEV_KEY;

  const fetchBookmarksCallback = useCallback((page: number, limit: number) => {
    return bookmarkApi.getAll({ page, limit });
  }, []);

  const filterFunction = useCallback((item: Bookmark, query: string) => {
    const lowerQuery = query.toLowerCase();
    return !!(
      (item.label && item.label.toLowerCase().includes(lowerQuery)) ||
      (item.note && item.note.toLowerCase().includes(lowerQuery)) ||
      (item.url && item.url.toLowerCase().includes(lowerQuery))
    );
  }, []);

  const {
    items: bookmarks,
    setItems: setBookmarks,
    loading,
    isSearching,
    currentPage,
    hasMore,
    hasPrev,
    nextPage,
    prevPage,
  } = useIterativeSearch<Bookmark>({
    fetchFunction: fetchBookmarksCallback,
    searchQuery: searchTerm,
    filterFunction,
    pageSize: 40,
    enabled: isLoggedIn,
  });

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchInput(e.target.value);
  };

  const fetchLogoUrl = async (url: string): Promise<string | null> => {
    try {
      const domain = new URL(url).hostname;
      return `https://img.logo.dev/${domain}?token=${logoKey}`;
    } catch (error) {
      console.error("Error fetching logo URL:", error);
      return null;
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
        toast.success("Bookmark deleted successfully!");
      }
    } catch (error) {
      console.error("Failed to delete contact", error);
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

  const handleCreateBookmark = async (values: Partial<CreateBookmarkData>) => {
    try {
      const logoUrl = await fetchLogoUrl(values.url || "");
      const dataWithLogo = values;

      if (logoUrl) {
        dataWithLogo.logoUrl = logoUrl;
      }

      const res = await bookmarkApi.create(dataWithLogo);
      if (res.status === "error") {
        toast.error(res.err?.message || "Something went wrong");
      } else if (res.data) {
        setBookmarks((prevItems) => [res.data!, ...prevItems]);
        toast.success("Bookmark added successfully!");
      }
    } catch (error) {
      console.error("Error adding bookmark:", error);
      toast.error("Something went wrong");
    }
  };

  const handleUpdate = async (docId: string, values: Partial<CreateBookmarkData>) => {
    try {
      const logoUrl = await fetchLogoUrl(values.url || "");
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

  return (
    <>
      <SEO
        title="Bookmarks"
        description="Save, update, and manage your favorite links easily. Keep your bookmarks organized and accessible in one place."
        keywords="bookmarks, save links, organize bookmarks, favorite links, manage bookmarks"
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
        )}
        {/* Contact Grid */}
        {loading && bookmarks.length === 0 && (
          <Flex justify="center" align="center" height="60vh">
            <VStack gap={6}>
              <SearchingLoader isSearching={isSearching} text="Loading bookmarks..." />
            </VStack>
          </Flex>
        )}

        {!loading && bookmarks.length === 0 && !isSearching && <NoItems text="bookmarks" />}

        {(bookmarks.length > 0 || isSearching) && (
          <>
            <BookmarksGrid
              handleUpdateBookmark={handleUpdate}
              bookmarks={bookmarks}
              handleDeleteBookmark={handleDelete}
            />
            <SearchingLoader isSearching={isSearching} />

            {/* Pagination Controls */}
            {isLoggedIn && bookmarks.length > 0 && !isSearching && (
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

export default Bookmarks;
