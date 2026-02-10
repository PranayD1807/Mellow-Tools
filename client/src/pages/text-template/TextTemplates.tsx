import textTemplateApi from "@/api/modules/textTemplates.api";
import { useIterativeSearch } from "@/hooks/useIterativeSearch";
import SearchingLoader from "@/components/SearchingLoader";
import NoItems from "@/components/NoItems";
import TextTemplatesGrid from "@/components/TextTemplatesGrid";
import { Button } from "@/components/ui/button";
import { TextTemplate } from "@/models/TextTemplate";
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
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { useSelector } from "react-redux";
import { RootState } from "@/store/store";

const TextTemplates = () => {
  const isLoggedIn = useSelector((state: RootState) => state.user.isLoggedIn);
  const [searchInput, setSearchInput] = useState<string>("");
  const [searchTerm, setSearchTerm] = useState<string>("");

  const navigate = useNavigate();

  const fetchTemplatesCallback = useCallback((page: number, limit: number) => {
    return textTemplateApi.getAll({ page, limit });
  }, []);

  const filterFunction = useCallback((item: TextTemplate, query: string) => {
    const lowerQuery = query.toLowerCase();
    return !!(
      (item.title && item.title.toLowerCase().includes(lowerQuery)) ||
      (item.content && item.content.toLowerCase().includes(lowerQuery))
    );
  }, []);

  const {
    items: templates,
    setItems: setTemplates,
    loading,
    isSearching,
    currentPage,
    hasMore,
    hasPrev,
    nextPage,
    prevPage,
  } = useIterativeSearch<TextTemplate>({
    fetchFunction: fetchTemplatesCallback,
    searchQuery: searchTerm,
    filterFunction,
    pageSize: 20,
    enabled: isLoggedIn,
  });

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchInput(e.target.value);
  };

  const handleDelete = async (templateId: string) => {
    try {
      const res = await textTemplateApi.delete(templateId);
      if (res.err) {
        toast.error(res.err.message);
      } else {
        setTemplates((prevTemplates) =>
          prevTemplates.filter((template) => template.id !== templateId)
        );
        toast.success("Template deleted successfully!");
      }
    } catch (error) {
      console.error("Failed to delete contact", error);
    }
  };

  const handleAddTemplate = () => {
    navigate("/text-templates/create");
  };

  const handleTemplateSearch = () => {
    setSearchTerm(searchInput);
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleTemplateSearch();
    }
  };

  return (
    <>
      <SEO
        title="Text Templates"
        description="Create, update, and manage text templates efficiently. Organize your text templates in one place."
        keywords="text templates, create template, update template, manage templates, organize text templates"
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
                onClick={handleTemplateSearch}
                variant="subtle"
                width="auto"
              >
                <IoSearch />
              </IconButton>
            </Flex>
            {/* Add Contact Button */}
            <Box width={{ base: "100%", md: "30%" }} ml={{ base: 0, md: 4 }}>
              <Button colorScheme="teal" width="100%" onClick={handleAddTemplate}>
                <HiViewGridAdd /> Add Text Template
              </Button>
            </Box>
          </Flex>
        )}
        {/* Contact Grid */}
        {loading && templates.length === 0 && (
          <Flex justify="center" align="center" height="60vh">
            <VStack gap={6}>
              <SearchingLoader isSearching={isSearching} text="Loading templates..." />
            </VStack>
          </Flex>
        )}

        {!loading && templates.length === 0 && !isSearching && <NoItems text="templates" />}

        {(templates.length > 0 || isSearching) && (
          <>
            <TextTemplatesGrid
              templates={templates}
              handleDeleteTemplate={handleDelete}
            />
            <SearchingLoader isSearching={isSearching} />

            {/* Pagination Controls */}
            {isLoggedIn && templates.length > 0 && !isSearching && (
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

export default TextTemplates;
