import textTemplateApi from "@/api/modules/textTemplates.api";
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
import { useEffect, useState } from "react";
import { HiViewGridAdd } from "react-icons/hi";
import { IoSearch } from "react-icons/io5";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

const TextTemplates = () => {
  const [templates, setTemplates] = useState<TextTemplate[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchTerm, setSearchTerm] = useState<string>("");

  const navigate = useNavigate();

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  const fetchTemplates = async (query: string = "") => {
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
    fetchTemplates(searchTerm);
  };

  useEffect(() => {
    if (searchTerm === "") {
      fetchTemplates();
    }
  }, [searchTerm]);

  return (
    <Flex direction="column" p={4} alignItems="center" gap={6} w="100%" mt={4}>
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
        <TextTemplatesGrid
          templates={templates}
          handleDeleteTemplate={handleDelete}
        />
      )}
    </Flex>
  );
};

export default TextTemplates;
