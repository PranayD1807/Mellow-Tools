import {
    Box,
    Flex,
    Heading,
    useBreakpointValue,
    Text,
    VStack,
    Spinner,
    Badge,
    Icon,
} from "@chakra-ui/react";
import { useEffect, useState } from "react";
import userApi, { UserInfo } from "@/api/modules/user.api";
import { Button } from "@/components/ui/button";
import TwoFactorSetup from "@/components/TwoFactorSetup";
import { toast } from "react-toastify";
import {
    DialogActionTrigger,
    DialogBody,
    DialogCloseTrigger,
    DialogContent,
    DialogFooter,
    DialogHeader,
    DialogRoot,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { LuShieldCheck, LuShieldAlert } from "react-icons/lu";

const TwoFactorAuth = () => {
    const [user, setUser] = useState<UserInfo | null>(null);
    const [loading, setLoading] = useState(true);
    const [isSetupOpen, setIsSetupOpen] = useState(false);
    const [disableLoading, setDisableLoading] = useState(false);
    const [isDisableDialogOpen, setIsDisableDialogOpen] = useState(false);

    const fetchUserInfo = async () => {
        try {
            const res = await userApi.getInfo();
            if (res.data && res.data.data) {
                setUser(res.data.data);
            }
        } catch (error) {
            console.error("Failed to fetch user info");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchUserInfo();
    }, []);

    const handleDisable2FA = async () => {
        setIsDisableDialogOpen(false);
        setDisableLoading(true);
        const res = await userApi.disable2FA();
        setDisableLoading(false);

        if (res.err) {
            toast.error(res.err.message || "Failed to disable 2FA");
        } else if (res.status === "success") {
            toast.success("Two-Factor Authentication Disabled");
            fetchUserInfo();
        }
    };

    return (
        <Flex align="center" justify="center" mt={10} width="100%" mb={10}>
            <Box
                display="flex"
                flexDirection="column"
                p={10}
                gap={8}
                rounded="xl"
                w={useBreakpointValue({ base: "90%", sm: "80%", md: "60%", lg: "50%" })}
                boxShadow="xl"
                alignItems="center"
                justifyContent="center"
                bg="bg.surface"
                borderWidth="1px"
                borderColor="border.subtle"
            >
                <VStack gap={3}>
                    <Box
                        p={4}
                        bg={user?.isTwoFactorEnabled ? "green.subtle" : "orange.subtle"}
                        color={user?.isTwoFactorEnabled ? "green.fg" : "orange.fg"}
                        rounded="full"
                    >
                        <Icon size="xl" as={user?.isTwoFactorEnabled ? LuShieldCheck : LuShieldAlert} />
                    </Box>
                    <Heading fontSize="2xl" textAlign="center" fontWeight="extrabold">
                        Two-Factor Authentication
                    </Heading>
                    <Text color="fg.muted" fontSize="md" textAlign="center" maxW="md">
                        Add an extra layer of security to your account by requiring a code from your authenticator app when you log in.
                    </Text>
                </VStack>

                {loading ? (
                    <Spinner size="lg" color="blue.500" />
                ) : (
                    <Box width="full">
                        {user?.isTwoFactorEnabled ? (
                            <VStack gap={6} width="full">
                                <Box p={4} bg="green.subtle" width="full" borderRadius="lg" display="flex" flexDirection="column" alignItems="center" gap={2}>
                                    <Badge colorPalette="green" size="lg" variant="solid">Active</Badge>
                                    <Text color="green.fg" fontWeight="medium">
                                        Your account is secured with 2FA.
                                    </Text>
                                </Box>
                                <DialogRoot open={isDisableDialogOpen} onOpenChange={(e) => setIsDisableDialogOpen(e.open)}>
                                    <DialogTrigger asChild>
                                        <Button
                                            colorScheme="red"
                                            variant="subtle"
                                            loading={disableLoading}
                                            width="full"
                                            size="lg"
                                        >
                                            Disable Two-Factor Auth
                                        </Button>
                                    </DialogTrigger>
                                    <DialogContent>
                                        <DialogHeader>
                                            <DialogTitle>Disable Two-Factor Authentication</DialogTitle>
                                        </DialogHeader>
                                        <DialogBody>
                                            <VStack align="center" py={4} gap={4}>
                                                <Box p={3} bg="red.subtle" color="red.fg" rounded="full">
                                                    <Icon size="lg" as={LuShieldAlert} />
                                                </Box>
                                                <Text textAlign="center">
                                                    Are you sure you want to disable 2FA? <br />
                                                    <strong>Your account will be less secure against unauthorized access.</strong>
                                                </Text>
                                            </VStack>
                                        </DialogBody>
                                        <DialogFooter>
                                            <DialogActionTrigger asChild>
                                                <Button variant="outline">Cancel</Button>
                                            </DialogActionTrigger>
                                            <Button colorScheme="red" onClick={handleDisable2FA}>
                                                Yes, Disable Security
                                            </Button>
                                        </DialogFooter>
                                        <DialogCloseTrigger />
                                    </DialogContent>
                                </DialogRoot>
                            </VStack>
                        ) : (
                            <VStack gap={6} width="full">
                                <Box p={4} bg="orange.subtle" width="full" borderRadius="lg" display="flex" flexDirection="column" alignItems="center" gap={2}>
                                    <Badge colorPalette="orange" size="lg" variant="solid">Not Enabled</Badge>
                                    <Text color="orange.fg" fontWeight="medium" textAlign="center">
                                        Protect your account from unauthorized access.
                                    </Text>
                                </Box>
                                <Button
                                    onClick={() => setIsSetupOpen(true)}
                                    width="full"
                                    colorScheme="blue"
                                    size="lg"
                                    fontWeight="bold"
                                >
                                    Enable Two-Factor Auth
                                </Button>
                            </VStack>
                        )}
                    </Box>
                )}
            </Box>

            <TwoFactorSetup
                isOpen={isSetupOpen}
                onClose={() => setIsSetupOpen(false)}
                onSuccess={() => {
                    fetchUserInfo();
                }}
            />
        </Flex>
    );
};

export default TwoFactorAuth;
