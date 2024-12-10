import { ReactNode, useState } from "react";
import { HStack, VStack, Input } from "@chakra-ui/react";
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

const validateForm = (values: { tag: string; defaultText?: string }) => {
  const errors: { tag?: string } = {};

  if (!values.tag) {
    errors.tag = "Tag is required";
  }

  return errors;
};

interface AddTextTemplateDialogProps {
  children: ReactNode;
  onSave: (values: { tag: string; defaultText?: string }) => void;
  initialValues?: Partial<{ tag: string; defaultText: string }>;
  title?: string;
}

const TextTemplateDialog: React.FC<AddTextTemplateDialogProps> = ({
  children,
  onSave,
  initialValues = {},
  title = "Add Placeholder Tag",
}) => {
  const [open, setOpen] = useState(false);

  const formattedInitialValues = {
    tag: initialValues.tag || "",
    defaultText: initialValues.defaultText || "",
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
                    {/* Tag Field */}
                    <Field
                      label="Tag"
                      required
                      helperText="Example: Enter placeholder tag here, such as [Name] or [Age]. These placeholders should be used in your template."
                      errorText={errors.tag}
                      invalid={touched.tag && !!errors.tag}
                    >
                      <FormikField
                        name="tag"
                        as={Input}
                        placeholder="Placeholder Tag"
                        variant="outline"
                        onChange={handleChange}
                        value={values.tag}
                      />
                    </Field>

                    {/* Default Text Field (Optional) */}
                    <Field
                      label="Default Text"
                      errorText={errors.defaultText}
                      invalid={touched.defaultText && !!errors.defaultText}
                    >
                      <FormikField
                        name="defaultText"
                        as={Input}
                        placeholder="Enter default text (optional)"
                        variant="outline"
                        onChange={handleChange}
                        value={values.defaultText || ""}
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

export default TextTemplateDialog;
