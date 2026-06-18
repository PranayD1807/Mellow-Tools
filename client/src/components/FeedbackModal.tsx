import { VStack, Input, Textarea, HStack, Text } from "@chakra-ui/react";
import { useState, ChangeEvent, FormEvent } from "react";
import feedbackApi from "@/api/modules/feedback.api";
import { toast } from "react-toastify";
import { Button } from "./ui/button";
import { Field } from "./ui/field";
import {
    DialogBody,
    DialogCloseTrigger,
    DialogContent,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogRoot,
} from "./ui/dialog";

interface FeedbackModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export default function FeedbackModal({ isOpen, onClose }: FeedbackModalProps) {
    const [text, setText] = useState("");
    const [images, setImages] = useState<File[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            const incomingFiles = Array.from(e.target.files);
            
            // Check if any incoming files are already selected
            const duplicates = incomingFiles.filter(newFile => 
                images.some(existingFile => 
                    existingFile.name === newFile.name && 
                    existingFile.size === newFile.size && 
                    existingFile.type === newFile.type
                )
            );

            if (duplicates.length > 0) {
                setError("You have already selected this image.");
                return;
            }
            
            if (images.length + incomingFiles.length > 2) {
                setError("You can only upload up to 2 images.");
                return;
            }

            for (let i = 0; i < incomingFiles.length; i++) {
                if (incomingFiles[i].size > 5 * 1024 * 1024) {
                    setError("Each image must be smaller than 5MB.");
                    return;
                }
                if (!["image/jpeg", "image/png", "image/jpg"].includes(incomingFiles[i].type)) {
                    setError("Only PNG and JPEG files are allowed.");
                    return;
                }
            }

            setError("");
            setImages(prev => [...prev, ...incomingFiles]);
            e.target.value = "";
        }
    };

    const removeImage = (indexToRemove: number) => {
        setImages(prev => prev.filter((_, idx) => idx !== indexToRemove));
        setError("");
    };

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        
        if (!text.trim()) {
            setError("Feedback text is required.");
            return;
        }

        setLoading(true);
        setError("");

        const formData = new FormData();
        formData.append("text", text);
        images.forEach(img => {
            formData.append("images", img);
        });

        const { err } = await feedbackApi.submitFeedback(formData);

        setLoading(false);

        if (err) {
            setError(err.message || "Something went wrong.");
            return;
        }

        toast.success("Feedback submitted successfully. Thank you!");
        setText("");
        setImages([]);
        onClose();
    };

    return (
        <DialogRoot 
            open={isOpen} 
            onOpenChange={(e) => !e.open && !loading && onClose()}
            size="md"
        >
            <DialogContent bg="gray.800" color="white">
                <DialogHeader>
                    <DialogTitle>Submit Feedback</DialogTitle>
                </DialogHeader>
                <DialogCloseTrigger disabled={loading} />
                <form onSubmit={handleSubmit} style={{ width: "100%" }}>
                    <DialogBody>
                        <VStack gap={4} align="stretch">
                            <Field label="Your Feedback" invalid={!!error}>
                                <Textarea 
                                    value={text} 
                                    onChange={(e) => {
                                        setText(e.target.value);
                                        if (error) setError("");
                                    }} 
                                    placeholder="Tell us what you think..." 
                                    rows={4} 
                                    bg="gray.700" 
                                    border="none"
                                    _focus={{ ring: 2, ringColor: "blue.400" }}
                                    disabled={loading}
                                />
                            </Field>

                            <Field 
                                label="Upload Images (Max 2, up to 5MB each)" 
                                invalid={!!error}
                                errorText={error}
                            >
                                <Input 
                                    type="file" 
                                    accept="image/png, image/jpeg, image/jpg" 
                                    multiple 
                                    onChange={handleFileChange} 
                                    p={1} 
                                    border="none"
                                    disabled={loading || images.length >= 2}
                                />
                            </Field>
                            {images.length > 0 && (
                                <VStack align="stretch" gap={2} mt={1}>
                                    {images.map((img, idx) => (
                                        <HStack key={idx} justify="space-between" bg="gray.700" p={2} borderRadius="md" w="100%" gap={4}>
                                            <Text fontSize="sm" color="gray.200" truncate flex="1">
                                                {img.name}
                                            </Text>
                                            <Button 
                                                size="xs" 
                                                variant="ghost" 
                                                colorPalette="red" 
                                                onClick={() => removeImage(idx)}
                                                disabled={loading}
                                            >
                                                Remove
                                            </Button>
                                        </HStack>
                                    ))}
                                </VStack>
                            )}
                        </VStack>
                    </DialogBody>

                    <DialogFooter w="100%">
                        <Button variant="ghost" mr={3} onClick={onClose} disabled={loading} colorPalette="whiteAlpha">
                            Cancel
                        </Button>
                        <Button colorPalette="blue" type="submit" loading={loading} loadingText="Submitting...">
                            Submit
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </DialogRoot>
    );
}
