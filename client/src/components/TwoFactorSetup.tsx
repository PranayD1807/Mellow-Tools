import React, { useState, useCallback } from "react";
import {
    Box,
    VStack,
    Text,
    Image,
    HStack,
    IconButton,
    Input,
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
} from "@/components/ui/dialog";
import userApi from "@/api/modules/user.api";
import { toast } from "react-toastify";
import { LuCopy } from "react-icons/lu";

interface TwoFactorSetupProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
}

const TwoFactorSetup: React.FC<TwoFactorSetupProps> = ({
    isOpen,
    onClose,
    onSuccess,
}) => {
    const [step, setStep] = useState<"loading" | "intro" | "qr" | "verify">("loading");
    const [secret, setSecret] = useState<string>("");
    const [qrCode, setQrCode] = useState<string>("");
    const [otp, setOtp] = useState<string>("");
    const [loading, setLoading] = useState(false);

    const loadQRCode = useCallback(async () => {
        try {
            const res = await userApi.generate2FA();
            if (res.err) {
                toast.error(res.err.message || "Failed to generate 2FA secret");
                onClose();
                return;
            }
            if (res.data && res.data.data) {
                setSecret(res.data.data.secret);
                setQrCode(res.data.data.qrCode);
                setStep("intro");
            }
        } catch (_) {
            toast.error("An error occurred");
            onClose();
        }
    }, [onClose]);

    React.useEffect(() => {
        if (isOpen) {
            setStep("loading");
            setOtp("");
            loadQRCode();
        }
    }, [isOpen, loadQRCode]);

    const handleVerify = async () => {
        if (!otp) return;
        setLoading(true);
        const res = await userApi.verify2FA(otp);
        setLoading(false);

        if (res.err) {
            toast.error(res.err.message || "Invalid code");
            return;
        }

        if (res.status === "success") {
            toast.success("Two-Factor Authentication Enabled!");
            onSuccess();
            onClose();
        }
    };

    const copyToClipboard = () => {
        navigator.clipboard.writeText(secret);
        toast.success("Secret copied to clipboard!");
    };

    return (
        <DialogRoot open={isOpen} onOpenChange={(e) => !e.open && onClose()} size="lg">
            <DialogContent>
                <DialogCloseTrigger />
                <DialogHeader>
                    <DialogTitle fontSize="xl">Set up Two-Factor Authentication</DialogTitle>
                </DialogHeader>
                <DialogBody pb={6}>
                    {step === "loading" && (
                        <VStack py={10}>
                            <Spinner size="xl" color="blue.500" />
                            <Text color="fg.muted">Generating secret...</Text>
                        </VStack>
                    )}

                    {step === "intro" && (
                        <VStack gap={5} align="stretch">
                            <Box p={4} bg="blue.subtle" color="blue.fg" borderRadius="md">
                                <Text fontWeight="bold" mb={1}>Step 1: Get an Authenticator App</Text>
                                <Text fontSize="sm">
                                    Download an authenticator app like <strong>Google Authenticator</strong>, <strong>Authy</strong>, or <strong>1Password</strong> on your mobile device.
                                </Text>
                            </Box>
                            <Button width="full" onClick={() => setStep("qr")}>
                                I have the app, continue
                            </Button>
                        </VStack>
                    )}

                    {step === "qr" && (
                        <VStack gap={6} align="center">
                            <Box textAlign="center">
                                <Text fontWeight="bold" fontSize="lg" mb={1}>Step 2: Scan QR Code</Text>
                                <Text color="fg.muted" fontSize="sm">
                                    Open your authenticator app and scan the image below.
                                </Text>
                            </Box>

                            <Box p={4} bg="bg.panel" borderRadius="lg" borderWidth="1px" borderColor="border.subtle" shadow="sm">
                                <Image src={qrCode} alt="2FA QR Code" boxSize="180px" />
                            </Box>

                            <Box width="full">
                                <Text fontSize="xs" color="fg.muted" textAlign="center" mb={2} textTransform="uppercase" fontWeight="bold">
                                    Or enter code manually
                                </Text>
                                <HStack gap={2} justify="center" bg="bg.subtle" p={3} borderRadius="md" borderWidth="1px" borderColor="border.subtle">
                                    <Text fontFamily="monospace" fontSize="md" fontWeight="bold" letterSpacing="wide">
                                        {secret}
                                    </Text>
                                    <IconButton aria-label="Copy secret" variant="ghost" size="xs" onClick={copyToClipboard}>
                                        <LuCopy />
                                    </IconButton>
                                </HStack>
                            </Box>

                            <Button width="full" onClick={() => setStep("verify")}>
                                Next: Verify Code
                            </Button>
                        </VStack>
                    )}

                    {step === "verify" && (
                        <VStack gap={6}>
                            <Box textAlign="center">
                                <Text fontWeight="bold" fontSize="lg" mb={1}>Step 3: Verify Code</Text>
                                <Text color="fg.muted" fontSize="sm">
                                    Enter the 6-digit code generated by your app to verify setup.
                                </Text>
                            </Box>

                            <Input
                                placeholder="000 000"
                                value={otp}
                                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                                maxLength={6}
                                textAlign="center"
                                fontSize="2xl"
                                height="60px"
                                letterSpacing="widest"
                                fontWeight="bold"
                                autoFocus
                            />

                            <Button
                                width="full"
                                onClick={handleVerify}
                                loading={loading}
                                disabled={otp.length !== 6}
                                colorScheme="blue"
                                size="lg"
                            >
                                Verify & Activate
                            </Button>

                            <Button variant="ghost" size="sm" onClick={() => setStep("qr")}>
                                Back to QR Code
                            </Button>
                        </VStack>
                    )}
                </DialogBody>
            </DialogContent>
        </DialogRoot>
    );
};

export default TwoFactorSetup;
