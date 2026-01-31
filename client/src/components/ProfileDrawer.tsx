import React from "react";
import {
    Box,
    VStack,
    Text,
    Heading,
    Separator,
    HStack,
} from "@chakra-ui/react";
import {
    DrawerBackdrop,
    DrawerBody,
    DrawerCloseTrigger,
    DrawerContent,
    DrawerFooter,
    DrawerHeader,
    DrawerRoot,
} from "@/components/ui/drawer";
import { Avatar } from "@/components/ui/avatar";
import { useSelector } from "react-redux";
import { RootState } from "@/store/store";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";

interface ProfileDrawerProps {
    open: boolean;
    onOpenChange: (details: { open: boolean }) => void;
}

const ProfileDrawer: React.FC<ProfileDrawerProps> = ({ open, onOpenChange }) => {
    const user = useSelector((state: RootState) => state.user);
    const navigate = useNavigate();

    const handlePasswordReset = () => {
        onOpenChange({ open: false });
        navigate("/update-password");
    };

    const avatarUrl = `https://api.dicebear.com/9.x/notionists/svg?seed=${user.displayName || "user"}`;

    return (
        <DrawerRoot open={open} onOpenChange={onOpenChange} size="md">
            <DrawerBackdrop />
            <DrawerContent>
                <DrawerHeader>
                    <DrawerCloseTrigger />
                </DrawerHeader>
                <DrawerBody>
                    <VStack gap={6} align="stretch">
                        {/* User Info Section */}
                        <HStack gap={4} p={4} bg="bg.subtle" rounded="md" align="center">
                            <Avatar
                                size="xl"
                                src={avatarUrl}
                                name={user.displayName || "User"}
                            />
                            <VStack align="start" gap={0}>
                                <Heading size="md">{user.displayName}</Heading>
                                <Text color="fg.muted" fontSize="sm">
                                    {user.email}
                                </Text>
                            </VStack>
                        </HStack>

                        <Separator />

                        {/* Change Password Section */}
                        <Box>
                            <Button
                                variant="outline"
                                width="100%"
                                onClick={handlePasswordReset}
                                data-testid="change-password-drawer-button"
                            >
                                Change Password 🔒
                            </Button>
                        </Box>
                    </VStack>
                </DrawerBody>
                <DrawerFooter />
            </DrawerContent>
        </DrawerRoot>
    );
};

export default ProfileDrawer;
