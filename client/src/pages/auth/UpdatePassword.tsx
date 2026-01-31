import React from "react";
import {
    Box,
    Flex,
    Heading,
    useBreakpointValue,
    Separator,
} from "@chakra-ui/react";
import UpdatePasswordForm from "@/components/UpdatePasswordForm";

const UpdatePassword = () => {
    return (
        <Flex align="center" justify="center" mt={10} width="100%">
            <Box
                display="flex"
                flexDirection="column"
                p={8}
                gap={4}
                rounded="md"
                w={useBreakpointValue({ base: "90%", sm: "80%", md: "60%", lg: "50%" })}
                boxShadow="md"
                alignItems="center"
                justifyContent="center"
                bg="bg.surface"
            >
                <Heading fontSize="2xl" textAlign="center">
                    Update Password 🔒
                </Heading>
                <Separator size="sm" marginBottom="10px" px={10} w="40%" />
                <UpdatePasswordForm />
            </Box>
        </Flex>
    );
};

export default UpdatePassword;
