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
import { CreateBookmarkData } from "@/models/Bookmark";

const validateBookmarkForm = (values: { label: string; url: string }) => {
  const errors: { label?: string; url?: string } = {};

  if (!values.label) {
    errors.label = "Label is required";
  }

  if (!values.url) {
    errors.url = "URL is required";
  }

  return errors;
};

interface BookmarkDialogProps {
  children?: ReactNode;
  onSave: (values: CreateBookmarkData) => Promise<void>;
  initialValues?: Partial<CreateBookmarkData>;
  title?: string;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

const BookmarkDialog: React.FC<BookmarkDialogProps> = ({
  children,
  onSave,
  initialValues = {},
  title = "Add Bookmark",
  open: controlledOpen,
  onOpenChange: setControlledOpen,
}) => {
  const [uncontrolledOpen, setUncontrolledOpen] = useState(false);

  const open = controlledOpen !== undefined ? controlledOpen : uncontrolledOpen;
  const setOpen = (newOpen: boolean) => {
    if (setControlledOpen) {
      setControlledOpen(newOpen);
    } else {
      setUncontrolledOpen(newOpen);
    }
  };

  const formattedInitialValues = {
    label: initialValues.label || "",
    note: initialValues.note || "",
    url: initialValues.url || "",
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
        {children && <DialogTrigger asChild>{children}</DialogTrigger>}
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{title}</DialogTitle>
          </DialogHeader>
          <DialogBody>
            <Formik
              initialValues={formattedInitialValues}
              validate={validateBookmarkForm}
              onSubmit={async (values, actions) => {
                const data = Object.assign(new CreateBookmarkData(), {
                  label: values.label,
                  note: values.note,
                  url: values.url,
                });

                await onSave(data);
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
                    {/* Label Field */}
                    <Field
                      label="Label"
                      required
                      errorText={errors.label}
                      invalid={touched.label && !!errors.label}
                    >
                      <FormikField
                        name="label"
                        as={Input}
                        placeholder="Bookmark Label"
                        variant="outline"
                        onChange={handleChange}
                        value={values.label}
                      />
                    </Field>

                    {/* URL Field */}
                    <Field
                      label="URL"
                      required
                      errorText={errors.url}
                      invalid={touched.url && !!errors.url}
                    >
                      <FormikField
                        name="url"
                        as={Input}
                        placeholder="https://example.com"
                        variant="outline"
                        onChange={handleChange}
                        value={values.url}
                      />
                    </Field>

                    {/* Note Field - Removed */}

                    <Field
                      label="Note (Optional)"
                      errorText={errors.note}
                      invalid={touched.note && !!errors.note}
                    >
                      <FormikField
                        name="note"
                        as={Textarea}
                        placeholder="Additional notes about this bookmark"
                        variant="outline"
                        onChange={handleChange}
                        value={values.note || ""}
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

export default BookmarkDialog;
