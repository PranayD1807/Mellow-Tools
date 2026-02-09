import React, { useState } from "react";
import {
    Box,
    VStack,
    Text,
    HStack,
    Spinner,
} from "@chakra-ui/react";
import { Button } from "@/components/ui/button";
import {
    DialogRoot,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogBody,
    DialogCloseTrigger,
    DialogFooter,
} from "@/components/ui/dialog";
import { DataMigrationHelper, MigrationResult } from "@/helper/dataMigration.helper";
import { useDispatch, useSelector } from "react-redux";
import { login } from "@/store/userSlice";
import { RootState } from "@/store/store";
import userApi from "@/api/modules/user.api";

interface DataMigrationDialogProps {
    isOpen: boolean;
    onClose: () => void;
}

type MigrationState = "idle" | "migrating" | "success" | "error";

const DataMigrationDialog: React.FC<DataMigrationDialogProps> = ({
    isOpen,
    onClose,
}) => {
    const [state, setState] = useState<MigrationState>("idle");
    const [result, setResult] = useState<MigrationResult | null>(null);
    const [error, setError] = useState<string>("");
    const dispatch = useDispatch();
    const user = useSelector((state: RootState) => state.user);

    const handleStartMigration = async () => {
        setState("migrating");
        setError("");

        try {
            const migrationResult = await DataMigrationHelper.migrateAllData();
            setResult(migrationResult);

            if (migrationResult.success) {
                // Update encryptionStatus to ENCRYPTED on server
                await userApi.updateEncryptionStatus("ENCRYPTED");

                // Update Redux state
                dispatch(
                    login({
                        displayName: user.displayName!,
                        email: user.email!,
                        userId: user.userId!,
                        encryptionStatus: "ENCRYPTED",
                    })
                );
                setState("success");
            } else {
                setState("error");
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : "Migration failed");
            setState("error");
        }
    };

    const handleClose = () => {
        if (state !== "migrating") {
            setState("idle");
            setResult(null);
            setError("");
            onClose();
        }
    };

    return (
        <DialogRoot
            open={isOpen}
            onOpenChange={(e) => !e.open && handleClose()}
            size="lg"
        >
            <DialogContent>
                <DialogCloseTrigger disabled={state === "migrating"} />
                <DialogHeader>
                    <DialogTitle fontSize="xl">
                        Encrypt Existing Data
                    </DialogTitle>
                </DialogHeader>
                <DialogBody pb={6}>
                    {state === "idle" && (
                        <VStack gap={4} align="stretch">
                            <Box p={4} bg="blue.subtle" color="blue.fg" borderRadius="md">
                                <Text fontWeight="bold" mb={2}>
                                    What does this do?
                                </Text>
                                <Text fontSize="sm">
                                    This will scan all your data (notes, bookmarks, templates, and job applications) and encrypt any items that are not yet encrypted. This is a one-time process for users who had data before encryption was enabled.
                                </Text>
                            </Box>

                            <Box p={4} bg="orange.subtle" color="orange.fg" borderRadius="md">
                                <Text fontWeight="bold" mb={2}>
                                    ⚠️ Important
                                </Text>
                                <Text fontSize="sm">
                                    • This process may take a few moments depending on how much data you have
                                    <br />
                                    • Do not close this window or log out during migration
                                    <br />
                                    • Already encrypted data will not be affected
                                </Text>
                            </Box>
                        </VStack>
                    )}

                    {state === "migrating" && (
                        <VStack gap={4} py={6}>
                            <Spinner size="xl" color="blue.500" />
                            <VStack gap={2}>
                                <Text fontWeight="bold" fontSize="lg">
                                    Encrypting your data...
                                </Text>
                                <Text color="fg.muted" fontSize="sm">
                                    Please wait, this may take a moment depending on your data size.
                                </Text>
                            </VStack>
                            <Box p={3} bg="orange.subtle" color="orange.fg" borderRadius="md" borderLeftWidth="4px" borderLeftColor="orange.solid">
                                <Text fontWeight="bold" fontSize="sm">
                                    ⚠️ Critical: Do not close the website or log out
                                </Text>
                                <Text fontSize="xs">
                                    Closing the tab now may result in partially encrypted data.
                                </Text>
                            </Box>
                        </VStack>
                    )}

                    {state === "success" && result && (
                        <VStack gap={4} align="stretch">
                            <Box p={4} bg="green.subtle" color="green.fg" borderRadius="md">
                                <Text fontWeight="bold" fontSize="lg" mb={2}>
                                    ✅ Migration Complete!
                                </Text>
                                <Text fontSize="sm">
                                    Your data has been successfully encrypted.
                                </Text>
                            </Box>

                            <Box p={4} bg="bg.subtle" borderRadius="md">
                                <Text fontWeight="bold" mb={3}>Summary:</Text>
                                <VStack gap={2} align="stretch" fontSize="sm">
                                    <HStack justify="space-between">
                                        <Text>Total items scanned:</Text>
                                        <Text fontWeight="bold">{result.totalItems}</Text>
                                    </HStack>
                                    <HStack justify="space-between">
                                        <Text>Newly encrypted:</Text>
                                        <Text fontWeight="bold" color="green.fg">
                                            {result.totalEncrypted}
                                        </Text>
                                    </HStack>
                                    <HStack justify="space-between">
                                        <Text>Already encrypted:</Text>
                                        <Text fontWeight="bold" color="blue.fg">
                                            {result.totalAlreadyEncrypted}
                                        </Text>
                                    </HStack>
                                    {result.totalFailed > 0 && (
                                        <HStack justify="space-between">
                                            <Text>Failed:</Text>
                                            <Text fontWeight="bold" color="red.fg">
                                                {result.totalFailed}
                                            </Text>
                                        </HStack>
                                    )}
                                </VStack>
                            </Box>

                            {result.collections.map((collection) => (
                                <Box
                                    key={collection.collectionName}
                                    p={3}
                                    bg="bg.panel"
                                    borderRadius="md"
                                    borderWidth="1px"
                                    borderColor="border.subtle"
                                >
                                    <Text fontWeight="bold" fontSize="sm" mb={2}>
                                        {collection.collectionName}
                                    </Text>
                                    <HStack gap={4} fontSize="xs" color="fg.muted">
                                        <Text>Total: {collection.total}</Text>
                                        {collection.encrypted > 0 && (
                                            <Text color="green.fg">
                                                Encrypted: {collection.encrypted}
                                            </Text>
                                        )}
                                        {collection.alreadyEncrypted > 0 && (
                                            <Text color="blue.fg">
                                                Already: {collection.alreadyEncrypted}
                                            </Text>
                                        )}
                                        {collection.failed > 0 && (
                                            <Text color="red.fg">
                                                Failed: {collection.failed}
                                            </Text>
                                        )}
                                    </HStack>
                                </Box>
                            ))}
                        </VStack>
                    )}

                    {state === "error" && (
                        <VStack gap={4} align="stretch">
                            <Box p={4} bg="red.subtle" color="red.fg" borderRadius="md">
                                <Text fontWeight="bold" fontSize="lg" mb={2}>
                                    ❌ Migration Failed
                                </Text>
                                <Text fontSize="sm">
                                    {error || "An error occurred during migration. Please try again or contact support."}
                                </Text>
                            </Box>

                            {result && result.collections.length > 0 && (
                                <Box p={4} bg="bg.subtle" borderRadius="md">
                                    <Text fontWeight="bold" mb={2} fontSize="sm">
                                        Partial Results:
                                    </Text>
                                    {result.collections.map((collection) => (
                                        <Box key={collection.collectionName} mb={2}>
                                            <Text fontSize="sm">
                                                {collection.collectionName}: {collection.encrypted} encrypted,{" "}
                                                {collection.failed} failed
                                            </Text>
                                            {collection.errors.length > 0 && (
                                                <VStack align="stretch" mt={1} ml={4} fontSize="xs" color="fg.muted">
                                                    {collection.errors.slice(0, 3).map((err, idx) => (
                                                        <Text key={idx}>• {err.error}</Text>
                                                    ))}
                                                    {collection.errors.length > 3 && (
                                                        <Text>
                                                            ... and {collection.errors.length - 3} more errors
                                                        </Text>
                                                    )}
                                                </VStack>
                                            )}
                                        </Box>
                                    ))}
                                </Box>
                            )}
                        </VStack>
                    )}
                </DialogBody>
                <DialogFooter>
                    {state === "idle" && (
                        <HStack gap={2} width="full">
                            <Button variant="outline" onClick={handleClose} flex={1}>
                                Cancel
                            </Button>
                            <Button
                                colorScheme="blue"
                                onClick={handleStartMigration}
                                flex={1}
                            >
                                Start Migration
                            </Button>
                        </HStack>
                    )}
                    {(state === "success" || state === "error") && (
                        <Button width="full" onClick={handleClose}>
                            Close
                        </Button>
                    )}
                </DialogFooter>
            </DialogContent>
        </DialogRoot>
    );
};

export default DataMigrationDialog;
