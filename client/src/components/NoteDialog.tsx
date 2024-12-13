import { ReactNode, useState } from "react";
import { HStack, VStack, Input, Textarea } from "@chakra-ui/react";
import { Button } from "@/components/ui/button";
import {
  DialogActionTrigger,
  DialogBody,
  DialogCloseTrigger,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogRoot,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Formik, Field as FormikField } from "formik";
import { Field } from "@/components/ui/field";

const validateForm = (values: { title: string; text?: string }) => {
  const errors: { title?: string; text?: string } = {};

  if (!values.title) {
    errors.title = "Title is required";
  }

  if (!values.text) {
    errors.text = "Text is required";
  }

  return errors;
};

interface NoteDialogProps {
  children: ReactNode;
  onSave: (values: { title: string; text: string }) => Promise<void>;
  initialValues?: Partial<{ title: string; text: string }>;
  title?: string;
}

const NoteDialog: React.FC<NoteDialogProps> = ({
  children,
  onSave,
  initialValues = {},
  title = "Add Note",
}) => {
  const [open, setOpen] = useState(false);

  const formattedInitialValues = {
    title: initialValues.title || "",
    text: initialValues.text || "",
  };

  return (
    <HStack wrap="wrap" gap="4" w="100%">
      <DialogRoot
        motionPreset="slide-in-bottom"
        placement="center"
        lazyMount
        open={open}
        onOpenChange={(e) => setOpen(e.open)}
      >
        <DialogTrigger asChild>{children}</DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{title}</DialogTitle>
          </DialogHeader>
          <DialogBody>
            <Formik
              initialValues={formattedInitialValues}
              validate={validateForm}
              onSubmit={async (values, actions) => {
                await onSave(values);
                setOpen(false);
                actions.resetForm();
              }}
            >
              {({
                handleSubmit,
                values,
                errors,
                touched,
                handleChange,
                isSubmitting,
              }) => (
                <form onSubmit={handleSubmit}>
                  <VStack gap={4}>
                    {/* Title Field */}
                    <Field
                      label="Title"
                      required
                      errorText={errors.title}
                      invalid={touched.title && !!errors.title}
                    >
                      <FormikField
                        name="title"
                        as={Input}
                        placeholder="Note Title"
                        variant="outline"
                        onChange={handleChange}
                        value={values.title}
                      />
                    </Field>

                    {/* Text Field */}
                    <Field
                      label="Text"
                      required
                      errorText={errors.text}
                      invalid={touched.text && !!errors.text}
                    >
                      <FormikField
                        name="text"
                        as={Textarea}
                        placeholder="Enter note text"
                        variant="outline"
                        onChange={handleChange}
                        value={values.text || ""}
                      />
                    </Field>

                    <DialogFooter justifyContent="flex-end" w="100%">
                      <DialogActionTrigger asChild>
                        <Button variant="outline">Cancel</Button>
                      </DialogActionTrigger>
                      <Button type="submit" loading={isSubmitting}>
                        Save
                      </Button>
                    </DialogFooter>
                  </VStack>
                </form>
              )}
            </Formik>
          </DialogBody>
          <DialogCloseTrigger />
        </DialogContent>
      </DialogRoot>
    </HStack>
  );
};

export default NoteDialog;
