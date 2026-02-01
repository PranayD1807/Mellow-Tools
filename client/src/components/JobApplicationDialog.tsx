import { ReactNode, useState } from "react";
import { HStack, VStack, Input, Textarea, Stack, createListCollection } from "@chakra-ui/react";
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
import {
    SelectContent,
    SelectItem,
    SelectRoot,
    SelectTrigger,
    SelectValueText,
    SelectItemText,
} from "@/components/ui/select";
import { Formik, Field as FormikField } from "formik";
import { Field } from "@/components/ui/field";
import { CreateJobApplicationData } from "@/models/JobApplication";

const validateForm = (values: CreateJobApplicationData) => {
    const errors: Partial<Record<keyof CreateJobApplicationData, string>> = {};

    if (!values.company) {
        errors.company = "Company is required";
    }

    if (!values.role) {
        errors.role = "Role is required";
    }

    if (!values.location) {
        errors.location = "Location is required";
    }

    return errors;
};

interface JobApplicationDialogProps {
    children?: ReactNode;
    onSave: (values: CreateJobApplicationData) => Promise<void>;
    initialValues?: Partial<CreateJobApplicationData>;
    title?: string;
    open?: boolean;
    onOpenChange?: (open: boolean) => void;
}

const statusOptions = createListCollection({
    items: [
        { label: "Applied", value: "Applied" },
        { label: "Interviewing", value: "Interviewing" },
        { label: "Offer", value: "Offer" },
        { label: "Rejected", value: "Rejected" },
    ],
});

const JobApplicationDialog: React.FC<JobApplicationDialogProps> = ({
    children,
    onSave,
    initialValues = {},
    title = "Add Job Application",
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

    // Check if this is an edit (has initial values) or a new application
    const isEditing = !!(initialValues.company || initialValues.role || initialValues.location);

    const formattedInitialValues: CreateJobApplicationData = {
        company: initialValues.company || "",
        role: initialValues.role || "",
        location: initialValues.location || "",
        status: initialValues.status || "Applied",
        jobLink: initialValues.jobLink || "",
        appliedOn: initialValues.appliedOn || new Date().toISOString().split("T")[0],
        note: initialValues.note || "",
        interviewStage: initialValues.interviewStage || "",
        nextInterviewDate: initialValues.nextInterviewDate || "",
    };

    return (
        <HStack wrap="wrap" gap="4" w="100%">
            <DialogRoot
                motionPreset="slide-in-bottom"
                placement="center"
                lazyMount
                open={open}
                onOpenChange={(e) => setOpen(e.open)}
                size="lg"
            >
                {children && <DialogTrigger asChild>{children}</DialogTrigger>}
                <DialogContent maxH="80vh" overflowY="auto">
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
                                setFieldValue,
                                isSubmitting,
                            }) => (
                                <form onSubmit={handleSubmit}>
                                    <VStack gap={4}>
                                        {/* Company Field */}
                                        <Field
                                            label="Company"
                                            required
                                            errorText={errors.company}
                                            invalid={touched.company && !!errors.company}
                                        >
                                            <FormikField
                                                name="company"
                                                as={Input}
                                                placeholder="Company Name"
                                                variant="outline"
                                                onChange={handleChange}
                                                value={values.company}
                                            />
                                        </Field>

                                        {/* Role Field */}
                                        <Field
                                            label="Role"
                                            required
                                            errorText={errors.role}
                                            invalid={touched.role && !!errors.role}
                                        >
                                            <FormikField
                                                name="role"
                                                as={Input}
                                                placeholder="Job Role/Title"
                                                variant="outline"
                                                onChange={handleChange}
                                                value={values.role}
                                            />
                                        </Field>

                                        {/* Location Field */}
                                        <Field
                                            label="Location"
                                            required
                                            errorText={errors.location}
                                            invalid={touched.location && !!errors.location}
                                        >
                                            <FormikField
                                                name="location"
                                                as={Input}
                                                placeholder="Job Location"
                                                variant="outline"
                                                onChange={handleChange}
                                                value={values.location}
                                            />
                                        </Field>

                                        {/* Status and Applied On - Side by Side */}
                                        <Stack direction={{ base: "column", md: "row" }} gap={4} w="100%">
                                            {/* Status Field */}
                                            <Field label="Status" flex="1">
                                                <SelectRoot
                                                    collection={statusOptions}
                                                    value={[values.status || "Applied"]}
                                                    onValueChange={(details) => setFieldValue("status", details.value[0])}
                                                >
                                                    <SelectTrigger>
                                                        <SelectValueText placeholder="Select Status" />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        {statusOptions.items.map((item) => (
                                                            <SelectItem key={item.value} item={item}>
                                                                <SelectItemText>{item.label}</SelectItemText>
                                                            </SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </SelectRoot>
                                            </Field>

                                            {/* Applied On Field */}
                                            <Field label="Applied On" flex="1">
                                                <Input
                                                    type="date"
                                                    name="appliedOn"
                                                    variant="outline"
                                                    onChange={handleChange}
                                                    value={values.appliedOn}
                                                />
                                            </Field>
                                        </Stack>

                                        {/* Job Link Field */}
                                        <Field label="Job Link">
                                            <FormikField
                                                name="jobLink"
                                                as={Input}
                                                placeholder="https://..."
                                                variant="outline"
                                                onChange={handleChange}
                                                value={values.jobLink || ""}
                                            />
                                        </Field>

                                        {/* Interview Stage and Next Interview Date - Only show when editing */}
                                        {isEditing && (
                                            <Stack direction={{ base: "column", md: "row" }} gap={4} w="100%">
                                                {/* Interview Stage Field */}
                                                <Field label="Interview Stage" flex="1">
                                                    <FormikField
                                                        name="interviewStage"
                                                        as={Input}
                                                        placeholder="e.g., Shortlisted, Round 1, Final"
                                                        variant="outline"
                                                        onChange={handleChange}
                                                        value={values.interviewStage || ""}
                                                    />
                                                </Field>

                                                {/* Next Interview Date Field */}
                                                <Field label="Next Interview Date" flex="1">
                                                    <Input
                                                        type="date"
                                                        name="nextInterviewDate"
                                                        variant="outline"
                                                        onChange={handleChange}
                                                        value={values.nextInterviewDate || ""}
                                                    />
                                                </Field>
                                            </Stack>
                                        )}

                                        {/* Note Field */}
                                        <Field label="Notes">
                                            <FormikField
                                                name="note"
                                                as={Textarea}
                                                placeholder="Additional notes about this application..."
                                                variant="outline"
                                                onChange={handleChange}
                                                value={values.note || ""}
                                                rows={3}
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

export default JobApplicationDialog;
