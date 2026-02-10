import { JobApplication, CreateJobApplicationData } from "@/models/JobApplication";
import { VStack } from "@chakra-ui/react";
import { useState } from "react";
import JobApplicationDialog from "./JobApplicationDialog";
import DeleteConfirmationDialog from "./DeleteConfirmationDialog";
import JobApplicationRow from "./JobApplicationRow";

interface JobApplicationTableProps {
    applications: JobApplication[];
    handleUpdateApplication: (id: string, values: Partial<CreateJobApplicationData>) => Promise<void>;
    handleDeleteApplication: (id: string) => Promise<void>;
}

const JobApplicationTable: React.FC<JobApplicationTableProps> = ({
    applications,
    handleUpdateApplication,
    handleDeleteApplication,
}) => {
    const [editingApplication, setEditingApplication] = useState<JobApplication | null>(null);
    const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
    const [deletingApplication, setDeletingApplication] = useState<JobApplication | null>(null);
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

    const handleEdit = (application: JobApplication) => {
        setEditingApplication(application);
        setIsEditDialogOpen(true);
    };

    const handleEditSave = async (values: Partial<CreateJobApplicationData>) => {
        if (editingApplication) {
            await handleUpdateApplication(editingApplication.id, values);
            setEditingApplication(null);
        }
    };

    const handleInlineUpdate = async (
        applicationId: string,
        field: keyof CreateJobApplicationData,
        value: string
    ) => {
        const application = applications.find((app) => app.id === applicationId);
        if (application) {
            await handleUpdateApplication(applicationId, {
                company: application.company,
                role: application.role,
                location: application.location,
                status: application.status,
                jobLink: application.jobLink,
                appliedOn: application.appliedOn?.split("T")[0],
                note: application.note,
                interviewStage: application.interviewStage,
                nextInterviewDate: application.nextInterviewDate?.split("T")[0],
                [field]: value,
            });
        }
    };

    return (
        <>
            <VStack gap={{ base: 4, md: 2 }} w="100%">
                {applications.map((application, index) => (
                    <JobApplicationRow
                        key={application.id}
                        application={application}
                        index={index}
                        handleEdit={handleEdit}
                        handleDelete={(app) => {
                            setDeletingApplication(app);
                            setIsDeleteDialogOpen(true);
                        }}
                        handleInlineUpdate={handleInlineUpdate}
                    />
                ))}
            </VStack>

            {/* Edit Dialog */}
            {editingApplication && (
                <JobApplicationDialog
                    title="Edit Job Application"
                    onSave={handleEditSave}
                    initialValues={{
                        company: editingApplication.company,
                        role: editingApplication.role,
                        location: editingApplication.location,
                        status: editingApplication.status,
                        jobLink: editingApplication.jobLink,
                        appliedOn: editingApplication.appliedOn?.split("T")[0],
                        note: editingApplication.note,
                        interviewStage: editingApplication.interviewStage,
                        nextInterviewDate: editingApplication.nextInterviewDate?.split("T")[0],
                    }}
                    open={isEditDialogOpen}
                    onOpenChange={setIsEditDialogOpen}
                />
            )}
            {/* Delete Dialog */}
            {deletingApplication && (
                <DeleteConfirmationDialog
                    open={isDeleteDialogOpen}
                    onOpenChange={setIsDeleteDialogOpen}
                    onDelete={async () => {
                        await handleDeleteApplication(deletingApplication.id);
                        setDeletingApplication(null);
                    }}
                    itemName={`${deletingApplication.company} - ${deletingApplication.role}`}
                />
            )}
        </>
    );
};

export default JobApplicationTable;
