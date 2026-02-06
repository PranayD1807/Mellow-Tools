import textTemplateApi from "@/api/modules/textTemplates.api";
import NoItems from "@/components/NoItems";
import TextTemplatesGrid from "@/components/TextTemplatesGrid";
import { Button } from "@/components/ui/button";
import { TextTemplate } from "@/models/TextTemplate";
import {
  Box,
  Flex,
  IconButton,
  Input,
  Spinner,
  Text,
  VStack,
} from "@chakra-ui/react";
import { useEffect, useState, useCallback } from "react";
import SEO from "@/components/SEO";
import { HiViewGridAdd } from "react-icons/hi";
import { IoSearch } from "react-icons/io5";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { useSelector } from "react-redux";
import { RootState } from "@/store/store";

const TextTemplates = () => {
  const isLoggedIn = useSelector((state: RootState) => state.user.isLoggedIn);
  const [templates, setTemplates] = useState<TextTemplate[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchTerm, setSearchTerm] = useState<string>("");

  const navigate = useNavigate();

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  const fetchTemplates = useCallback(async (query: string = "") => {
    if (!isLoggedIn) {
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const res = await textTemplateApi.getAll(query);

      if (res.status === "error") {
        toast.error(res.err?.message || "Something went wrong");
      } else if (res.status === "success" && res.data) {
        setTemplates(res.data);
      }
    } catch (error) {
      console.log(error);
      toast.error("Something went wrong");
    } finally {
      setLoading(false);
    }
  }, [isLoggedIn]);

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
    fetchTemplates(searchTerm);
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleTemplateSearch();
    }
  };

  useEffect(() => {
    if (isLoggedIn) {
      fetchTemplates();
    } else {
      setTemplates([]);
      setLoading(false);
    }
  }, [isLoggedIn, fetchTemplates]);

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
                value={searchTerm}
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
        {!loading && templates.length != 0 && (
          <TextTemplatesGrid
            templates={templates}
            handleDeleteTemplate={handleDelete}
          />
        )}
        {!loading && templates.length === 0 && <NoItems text="templates" />}
      </Flex>
    </>
  );
};

export default TextTemplates;
