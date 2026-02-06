import { Box, Flex, Text } from "@chakra-ui/react";
import { Link as RouterLink } from "react-router-dom";
import { useColorModeValue } from "@/hooks/ui/use-color-mode";
import { Button } from "@/components/ui/button";
import { HiLightningBolt } from "react-icons/hi";
import { motion } from "framer-motion";

const LoginBanner = () => {
    const bgGradient = useColorModeValue(
        "linear-gradient(90deg, #3182ce 0%, #4c51bf 100%)",
        "linear-gradient(90deg, #1A202C 0%, #2D3748 100%)"
    );
    const textColor = useColorModeValue("white", "whiteAlpha.900");
    const buttonBg = useColorModeValue("white", "blue.500");
    const buttonColor = useColorModeValue("blue.700", "white");

    return (
        <Box
            w="100%"
            style={{ background: bgGradient }}
            color={textColor}
            boxShadow="xl"
            position="relative"
            overflow="hidden"
            py={3}
        >
            {/* Dynamic Background Glow */}
            <motion.div
                style={{
                    position: "absolute",
                    top: "-150%",
                    left: "-50%",
                    width: "200%",
                    height: "400%",
                    background: "radial-gradient(circle, rgba(255,255,255,0.08) 0%, rgba(255,255,255,0) 70%)",
                    pointerEvents: "none",
                }}
                animate={{
                    x: ["-10%", "10%"],
                    rotate: [0, 2, -2, 0]
                }}
                transition={{
                    duration: 10,
                    repeat: Infinity,
                    repeatType: "mirror",
                    ease: "easeInOut",
                }}
            />

            <Flex
                direction={{ base: "column", md: "row" }}
                justify="center"
                align="center"
                maxW="1200px"
                mx="auto"
                gap={{ base: 4, md: 10 }}
                px={{ base: 4, md: 8 }}
                position="relative"
                zIndex={1}
            >
                <Flex align="center" gap={3}>
                    <motion.div
                        animate={{
                            scale: [1, 1.1, 1],
                        }}
                        transition={{
                            duration: 2,
                            repeat: Infinity,
                            ease: "easeInOut"
                        }}
                    >
                        <HiLightningBolt size={20} color="#F6E05E" />
                    </motion.div>
                    <Text fontWeight="800" fontSize={{ base: "sm", md: "md" }} textAlign={{ base: "center", md: "left" }}>
                        Sign in to save your progress and sync across all devices.
                    </Text>
                </Flex>

                <RouterLink to="/auth" style={{ textDecoration: 'none', width: '100%', maxWidth: 'max-content' }}>
                    <motion.div
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                    >
                        <Button
                            variant="solid"
                            bg={buttonBg}
                            color={buttonColor}
                            size="sm"
                            w={{ base: "full", md: "auto" }}
                            px={6}
                            fontWeight="800"
                            fontSize="xs"
                            borderRadius="full"
                            boxShadow="0 4px 12px rgba(0,0,0,0.15)"
                            _hover={{ opacity: 0.9 }}
                        >
                            SIGN IN NOW
                        </Button>
                    </motion.div>
                </RouterLink>
            </Flex>
        </Box>
    );
};

export default LoginBanner;
