import { useState, useRef, useEffect } from "react";
import { Editor } from "@tinymce/tinymce-react";
import { Editor as TinyMCEEditor } from "tinymce";
import {
  Box,
  VStack,
  Text,
  Textarea,
  Separator,
  Spinner,
  Flex,
  HStack,
} from "@chakra-ui/react";
import { Field } from "@/components/ui/field";
import { InputGroup } from "@/components/ui/input-group";
import textTemplateApi from "@/api/modules/textTemplates.api";
import { toast } from "react-toastify";
import { Button } from "@/components/ui/button";
import { FaMagic, FaCopy, FaFileExport } from "react-icons/fa";
import { TextTemplate } from "@/models/TextTemplate";
import { useParams } from "react-router-dom";
import he from "he";
import { Helmet } from "react-helmet-async";

// Editor Configuration
const editorConfig = {
  height: "100%",
  menubar: true,
  plugins: [
    "advlist",
    "autolink",
    "lists",
    "link",
    "image",
    "charmap",
    "preview",
    "anchor",
    "searchreplace",
    "visualblocks",
    "code",
    "fullscreen",
    "insertdatetime",
    "media",
    "table",
    "code",
    "help",
    "wordcount",
  ],

  toolbar:
    "undo redo | blocks | " +
    "bold italic forecolor | alignleft aligncenter " +
    "alignright alignjustify | bullist numlist outdent indent | " +
    "removeformat | help",
  content_style:
    "body { font-family:Helvetica,Arial,sans-serif; font-size:14px }",
};

const UseTextTemplate = () => {
  const [template, setTemplate] = useState<TextTemplate | null>(null);
  const editorRef = useRef<TinyMCEEditor | null>(null);

  const [placeholders, setPlaceholders] = useState<
    { tag: string; defaultText?: string }[]
  >([]);
  const [title, setTitle] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const { id } = useParams();

  const printContent = () => {
    editorRef.current?.contentWindow.print();
  };

  const copyToClipboard = () => {
    if (editorRef.current) {
      let renderedHtml = editorRef.current.getContent();

      renderedHtml = renderedHtml.replace(/&nbsp;/g, " ");

      // Convert HTML to plain text while preserving line breaks
      const plainText = renderedHtml
        .replace(/<br\s*\/?>/gi, "\n") // Replace <br> with newline
        .replace(/<\/p>/gi, "\n") // Replace closing </p> with newline
        .replace(/<\/div>/gi, "\n") // Replace closing </div> with newline
        .replace(/<[^>]+>/g, ""); // Remove all remaining HTML tags

      const clipboardItem = new ClipboardItem({
        "text/html": new Blob([renderedHtml], { type: "text/html" }),
        "text/plain": new Blob([plainText], { type: "text/plain" }),
      });

      navigator.clipboard
        .write([clipboardItem])
        .then(() => {
          toast.success("Content copied to clipboard!");
        })
        .catch((error) => {
          console.error("Error copying to clipboard:", error);
          toast.error("Failed to copy formatted content.");
        });
    }
  };

  useEffect(() => {
    // Load template data once
    const loadTemplateData = async () => {
      try {
        const res = await textTemplateApi.get(id || "");
        if (res.status === "error") {
          toast.error(res.err?.message || "Something went wrong");
        } else if (res.data) {
          setTemplate(res.data); // Set template data
        }
      } catch (error) {
        console.error("Error loading template:", error);
        toast.error("Something went wrong");
      } finally {
        setIsLoading(false);
      }
    };

    loadTemplateData();
  }, [id]);

  useEffect(() => {
    if (template) {
      // Set title
      setTitle(template.title || "");

      // Set placeholders
      if (template.placeholders) {
        setPlaceholders(
          template.placeholders.map((el) => ({
            tag: el.tag,
            defaultText: el.defaultValue,
          }))
        );
      }
    }
  }, [template]);

  const updatePlaceholder = (
    index: number,
    updatedValues: { defaultText: string }
  ) => {
    setPlaceholders((prevPlaceholders) =>
      prevPlaceholders.map((placeholder, idx) =>
        idx === index
          ? { ...placeholder, defaultText: updatedValues.defaultText }
          : placeholder
      )
    );
  };

  const onUsePlaceholdersHandler = () => {
    const str = he.decode(template?.content || "");

    // Iterate over all placeholders and replace their tags with their values
    let newStr = str;
    placeholders.forEach(({ tag, defaultText }) => {
      const value = defaultText?.trim() || "";
      if (value !== "") {
        newStr = newStr.split(tag).join(value); // Exact match and replace all occurrences
      }
    });

    editorRef.current?.setContent(newStr);
  };

  if (isLoading) {
    return (
      <Flex justify="center" align="center" height="80vh">
        <VStack gap={6}>
          <Spinner size="xl" borderWidth="4px" />
          <Text textStyle="2xl" fontWeight="bold">
            Loading...
          </Text>
        </VStack>
      </Flex>
    );
  }

  return (
    <>
      <Helmet>
        <title>Use Text Template - Apply Your Template to New Content</title>
        <meta
          name="description"
          content="Easily use and apply your text templates to create new content. Customize and generate text based on your saved templates."
        />
        <meta
          name="keywords"
          content="use text template, apply template, create content from template, generate text using template"
        />
        <meta
          property="og:title"
          content="Use Text Template - Apply Your Template to New Content"
        />
        <meta
          property="og:description"
          content="Easily use and apply your text templates to create new content. Customize and generate text based on your saved templates."
        />
        <meta property="og:image" content="/og-image.png" />
        <meta name="robots" content="index, follow" />
      </Helmet>
      <Flex
        flexDirection={{ base: "column", lg: "row" }}
        justifyContent="space-evenly"
        alignItems="center"
        h="100%"
        m={4}
        my={6}
      >
        <Box w={{ base: "90%", lg: "60vw" }} h={{ base: "50vh", lg: "80vh" }}>
          <Editor
            apiKey={import.meta.env.VITE_EDITOR_KEY}
            onInit={(_evt, editor) => (editorRef.current = editor)}
            initialValue={
              (template && he.decode(template.content)) ||
              "<p>Start writing...</p>"
            }
            init={editorConfig}
          />
        </Box>

        <VStack
          w={{ base: "90%", lg: "30vw" }}
          py={{
            base: 4,
            lg: 0,
          }}
          justifyContent="space-between"
          alignItems="start"
        >
          {/* Title */}
          <Text fontWeight="bold" fontSize="xl">
            {title}
          </Text>
          <Separator />
          {/* List of placeholders */}
          <Text fontSize="md" fontWeight="bold" h="30px">
            Placeholder Tags:
          </Text>
          <Box w="100%" h="calc(80vh - 180px)">
            <VStack
              gap={4}
              w="100%"
              overflowY="auto"
              h="100%"
              pb={2}
              pr={2}
            >
              {placeholders.map((placeholder, index) => (
                <Field key={index} label={placeholder.tag} w="100%">
                  <InputGroup flex="1" w="100%">
                    <Textarea
                      w="100%"
                      placeholder={placeholder.defaultText}
                      value={placeholder.defaultText}
                      textWrap="wrap"
                      onChange={(e) =>
                        updatePlaceholder(index, {
                          defaultText: e.target.value,
                        })
                      }
                    />
                  </InputGroup>
                </Field>
              ))}
            </VStack>
          </Box>
          <Separator />

          {/* Dialog to add new placeholder */}
          <VStack w="100%" gap={3}>
            <Button
              variant="solid"
              w="100%"
              onClick={onUsePlaceholdersHandler}
            >
              <FaMagic /> Apply Placeholders
            </Button>
            <HStack w="100%" gap={3}>
              <Button
                variant="surface"
                flex="1"
                onClick={copyToClipboard}
              >
                <FaCopy /> Copy Content
              </Button>
              <Button
                variant="surface"
                flex="1"
                onClick={printContent}
              >
                <FaFileExport /> Export PDF
              </Button>
            </HStack>
          </VStack>
        </VStack>
      </Flex>
    </>
  );
};

export default UseTextTemplate;
