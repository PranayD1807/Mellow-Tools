import { ReactNode, useState } from "react";
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

interface DeleteConfirmationDialogProps {
  children: ReactNode;
  onDelete: () => Promise<void>;
  itemName: string;
}

const DeleteConfirmationDialog: React.FC<DeleteConfirmationDialogProps> = ({
  children,
  onDelete,
  itemName,
}) => {
  const [open, setOpen] = useState(false);

  const handleConfirmDelete = async () => {
    await onDelete();
    setOpen(false);
  };

  return (
    <DialogRoot
      motionPreset="slide-in-bottom"
      placement="center"
      lazyMount
      open={open}
      onOpenChange={(e) => setOpen(e.open)}
    >
      <DialogTrigger asChild>{children}</DialogTrigger>

      {/* Dialog Content */}
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Confirm Deletion</DialogTitle>
        </DialogHeader>

        <DialogBody>
          <p>
            Are you sure you want to delete {itemName}? <br /> Note: This action
            is not reversible.
          </p>
        </DialogBody>

        {/* Dialog Footer */}
        <DialogFooter justifyContent="flex-end" w="100%">
          <DialogActionTrigger asChild>
            <Button variant="outline">Cancel</Button>
          </DialogActionTrigger>
          <Button colorScheme="red" onClick={handleConfirmDelete}>
            Delete
          </Button>
        </DialogFooter>

        <DialogCloseTrigger />
      </DialogContent>
    </DialogRoot>
  );
};

export default DeleteConfirmationDialog;
