import React, { useState, useEffect } from "react";
import {
    Box,
    VStack,
    Text,
    Separator,
} from "@chakra-ui/react";
import { Button } from "@/components/ui/button";
import {
    DialogRoot,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogBody,
} from "@/components/ui/dialog";
import { PasswordInput } from "@/components/ui/password-input";
import { Field } from "@/components/ui/field";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "@/store/store";
import { login } from "@/store/userSlice";
import userApi from "@/api/modules/user.api";
import Encryption from "@/helper/encryption.helper";
import { LocalStorageHelper } from "@/helper/localStorage.helper";
import { UserInfo } from "@/models/UserInfo";
import { toast } from "react-toastify";

const AccountMigrationDialog: React.FC = () => {
    const user = useSelector((state: RootState) => state.user);
    const dispatch = useDispatch();
    const [isOpen, setIsOpen] = useState(false);
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        // Show dialog if user is logged in but not migrated/encrypted
        // Old users might not have the encryptionStatus field at all
        const isUnencrypted = !user.encryptionStatus || user.encryptionStatus === "UNENCRYPTED";

        if (user.isLoggedIn && isUnencrypted) {
            setIsOpen(true);
        } else {
            setIsOpen(false);
        }
    }, [user.isLoggedIn, user.encryptionStatus]);

    const handleMigrate = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!password) return;
        setLoading(true);

        try {
            const freshlyGeneratedAESKey = await Encryption.generateAESKey();
            const passwordKeySalt = Encryption.generatePasswordKeySalt();
            const passwordDerivedKey = await Encryption.getPasswordDerivedKey(
                password,
                passwordKeySalt
            );
            const encryptedAESKey = await Encryption.encryptAESKey(
                freshlyGeneratedAESKey,
                passwordDerivedKey
            );

            const res = await userApi.migrateEncryption({
                password,
                encryptedAESKey,
                passwordKeySalt,
            });

            if (res.status === "error") {
                toast.error(res.err?.message || "Migration failed. Please check your password.");
                setLoading(false);
                return;
            }

            // Atomic bundle selection: Sync with existing server-side keys if available, otherwise use local keys.
            // We only use server keys if both encryptedAESKey and passwordKeySalt are present.
            const serverData = res.data?.data;
            const useServerKeys = !!(serverData?.encryptedAESKey && serverData?.passwordKeySalt);

            const finalEncryptedAESKey = useServerKeys ? serverData!.encryptedAESKey : encryptedAESKey;
            const finalPasswordKeySalt = useServerKeys ? serverData!.passwordKeySalt : passwordKeySalt;
            const finalStatus = useServerKeys ? serverData!.encryptionStatus : "MIGRATED";

            // Retrieve tokens early and validate
            const jwtToken = localStorage.getItem("actkn");
            const refreshToken = localStorage.getItem("refreshToken");

            if (!jwtToken || !refreshToken) {
                throw new Error("Session tokens not found. Please log in again.");
            }

            // Update LocalStorage (crucial for keys)
            try {
                const userInfo: UserInfo = {
                    id: user.userId!,
                    displayName: user.displayName!,
                    email: user.email!,
                    encryptionStatus: finalStatus,
                    encryptedAESKey: finalEncryptedAESKey,
                    passwordKeySalt: finalPasswordKeySalt,
                };

                await LocalStorageHelper.saveUserCreds({
                    userInfo,
                    password: password,
                    jwtToken,
                    refreshToken,
                });
            } catch (storageError) {
                console.error("Failed to persist migration credentials", storageError);
                toast.error("Failed to secure your account locally. Please try again.");
                setLoading(false);
                return;
            }

            // Update Redux state ONLY after successful persistence
            dispatch(
                login({
                    displayName: user.displayName!,
                    email: user.email!,
                    userId: user.userId!,
                    encryptionStatus: finalStatus,
                })
            );

            toast.success("Security update complete! Your account is now E2E encrypted.");
            setIsOpen(false);
        } catch (error: unknown) {
            console.error("Account migration failed", error);
            const errorMessage = error instanceof Error ? error.message : "An error occurred during migration. Please try again.";
            toast.error(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    return (
        <DialogRoot
            open={isOpen}
            onOpenChange={() => { }} // Mandatory dialog, cannot be closed by user
            size="md"
            role="alertdialog"
        >
            <DialogContent>
                <DialogHeader>
                    <DialogTitle fontSize="xl">🔒 Important Security Update</DialogTitle>
                </DialogHeader>
                <Separator />
                <DialogBody py={6}>
                    <VStack gap={4} align="stretch">
                        <Box p={4} bg="blue.subtle" color="blue.fg" borderRadius="md">
                            <Text fontWeight="bold" mb={2}>
                                End-to-End Encryption is here!
                            </Text>
                            <Text fontSize="sm">
                                We've upgraded Mellow Tools with E2E encryption to keep your data even safer. To continue, we need to set up your secure workspace.
                            </Text>
                        </Box>

                        <Text fontSize="sm" color="fg.muted">
                            Please enter your account password to generate your unique encryption keys. This is a one-time setup.
                        </Text>

                        <form onSubmit={handleMigrate}>
                            <VStack gap={4}>
                                <Field label="Account Password" required>
                                    <PasswordInput
                                        placeholder="Enter your password"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        disabled={loading}
                                    />
                                </Field>
                                <Button
                                    type="submit"
                                    width="full"
                                    colorScheme="blue"
                                    loading={loading}
                                    loadingText="Securing Account..."
                                >
                                    Finish Setup
                                </Button>
                            </VStack>
                        </form>
                    </VStack>
                </DialogBody>
            </DialogContent>
        </DialogRoot>
    );
};

export default AccountMigrationDialog;
