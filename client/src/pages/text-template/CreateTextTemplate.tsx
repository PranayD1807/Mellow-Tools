import { useState, useRef } from "react";
import { Editor } from "@tinymce/tinymce-react";
import { Editor as TinyMCEEditor } from "tinymce";

import {
  Box,
  VStack,
  Text,
  IconButton,
  Textarea,
  Input,
  Separator,
  Flex,
} from "@chakra-ui/react";
import TextTemplateDialog from "@/components/TextTemplateDialog";
import { Field } from "@/components/ui/field";
import { InputGroup } from "@/components/ui/input-group";
import { MdOutlineDeleteOutline } from "react-icons/md";
import textTemplateApi, {
  CreateTextTemplateData,
} from "@/api/modules/textTemplates.api";
import { toast } from "react-toastify";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

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

const CreateTextTemplate = () => {
  const editorRef = useRef<TinyMCEEditor | null>(null);

  const [placeholders, setPlaceholders] = useState<
    { tag: string; defaultText?: string }[]
  >([]);
  const [title, setTitle] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const navigate = useNavigate();

  const onAddPlaceholder = (values: { tag: string; defaultText?: string }) => {
    setPlaceholders((prevPlaceholders) => [
      ...prevPlaceholders,
      { tag: values.tag, defaultText: values.defaultText },
    ]);
  };

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

  const deletePlaceholder = (index: number) => {
    setPlaceholders((prevPlaceholders) =>
      prevPlaceholders.filter((_, idx) => idx !== index)
    );
  };

  const submitTemplate = async () => {
    if (!editorRef.current) return;
    setIsSaving(true);

    const data: CreateTextTemplateData = {
      title,
      content: editorRef.current?.getContent(),
      placeholders: placeholders.map((p) => ({
        tag: p.tag,
        defaultValue: p.defaultText,
      })),
    };

    try {
      const res = await textTemplateApi.create(data);
      if (res.status === "error") {
        // Handle error response
        toast.error(res.err?.message || "Something went wrong");
      } else if (res.data) {
        toast.success("Text Template created successfully!");
        navigate("/text-templates");
      }
    } catch (error) {
      console.error("Error submitting template:", error);
      toast.error("Something went wrong");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Flex
      flexDirection={{ base: "column", lg: "row" }}
      justifyContent="space-evenly"
      alignItems="center"
      h="100%"
      my={6}
      m={4}
    >
      <Box w={{ base: "90%", lg: "60vw" }} h={{ base: "50vh", lg: "80vh" }}>
        <Editor
          apiKey={import.meta.env.VITE_EDITOR_KEY}
          onInit={(_evt, editor) => {
            editorRef.current = editor;
          }}
          initialValue="<p>Start writing...</p>"
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
        <Field label="Template Title" required h="80px">
          <Input
            placeholder="My New Template"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
        </Field>
        <Separator />
        {/* List of placeholders */}
        <Text fontSize="md" fontWeight="bold" h="30px">
          Placeholder Tags:
        </Text>
        <Box w="100%" h="calc(80vh - 180px)">
          <VStack
            gap={4}
            w="100%"
            scrollbar="hidden"
            overflowY="scroll"
            h="100%"
            pb={2}
          >
            {placeholders.map((placeholder, index) => (
              <Field key={index} label={placeholder.tag} w="100%">
                <InputGroup
                  flex="1"
                  w="100%"
                  endElement={
                    <>
                      <IconButton
                        aria-label="Call support"
                        variant="ghost"
                        m={0}
                        p={0}
                        onClick={() => deletePlaceholder(index)}
                      >
                        <MdOutlineDeleteOutline />
                      </IconButton>
                    </>
                  }
                >
                  <Textarea
                    w="100%"
                    placeholder={placeholder.defaultText}
                    value={placeholder.defaultText}
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
        <TextTemplateDialog
          children={
            <Button w="100%" variant="surface">
              Add Placeholder
            </Button>
          }
          onSave={onAddPlaceholder}
        />
        <Button
          w="100%"
          loading={isSaving}
          loadingText="Saving..."
          onClick={submitTemplate}
        >
          Save
        </Button>
      </VStack>
    </Flex>
  );
};

export default CreateTextTemplate;
