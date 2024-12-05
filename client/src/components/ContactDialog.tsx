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

const validateContact = (values: {
  name: string;
  email: string;
  phone: string;
}) => {
  const errors: { name?: string; email?: string; phone?: string } = {};

  if (!values.name) {
    errors.name = "Name is required";
  }

  if (!values.email) {
    errors.email = "Email is required";
  } else if (!/\S+@\S+\.\S+/.test(values.email)) {
    errors.email = "Please enter a valid email address";
  }

  if (!values.phone) {
    errors.phone = "Phone number is required";
  }

  return errors;
};

interface AddContactDialogProps {
  children: ReactNode;
  onSave: (values: { name: string; email: string; phone: string }) => Promise<void>;
  initialValues?: Partial<{ name: string; email: string; phone: string }>;
  title?: string;
}

const ContactDialog: React.FC<AddContactDialogProps> = ({
  children,
  onSave,
  initialValues = {},
  title = "Add Contact",
}) => {
  const [open, setOpen] = useState(false);

  const formattedInitialValues = {
    name: initialValues.name || "",
    email: initialValues.email || "",
    phone: initialValues.phone || "",
  };

  return (
    <HStack wrap="wrap" gap="4">
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
              validate={validateContact}
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
                    {/* Name Field */}
                    <Field
                      label="Name"
                      required
                      errorText={errors.name}
                      invalid={touched.name && !!errors.name}
                    >
                      <FormikField
                        name="name"
                        as={Input}
                        placeholder="Full Name"
                        variant="outline"
                        onChange={handleChange}
                        value={values.name}
                      />
                    </Field>

                    {/* Email Field */}
                    <Field
                      label="Email"
                      required
                      errorText={errors.email}
                      invalid={touched.email && !!errors.email}
                    >
                      <FormikField
                        name="email"
                        as={Input}
                        placeholder="me@example.com"
                        variant="outline"
                        onChange={handleChange}
                        value={values.email}
                      />
                    </Field>

                    {/* Phone Field */}
                    <Field
                      label="Phone Number"
                      required
                      errorText={errors.phone}
                      invalid={touched.phone && !!errors.phone}
                    >
                      <FormikField
                        name="phone"
                        as={Input}
                        placeholder="123-456-7890"
                        variant="outline"
                        onChange={handleChange}
                        value={values.phone}
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

export default ContactDialog;
