import { Box, Button, Flex, Image, Text, VStack } from "@chakra-ui/react";
import { FaGithub } from "react-icons/fa";

const ContributeCard = () => {
  return (
    <Flex
      borderRadius="lg"
      boxShadow="lg"
      p={6}
      w={{ base: "80%", md: "60%" }}
      mb={6}
      gap={6}
      _hover={{ boxShadow: "xl", transform: "scale(1.05)" }}
      transition="all 0.3s ease"
      direction={{
        base: "column",
      }}
      alignItems="center"
    >
      <Box>
        <Image src="/contribute.png" h="250px" />
      </Box>
      <VStack gap={4} align="center" flex={3}>
        <Text fontSize="xl" fontWeight="bold">
          Want to Contribute?
        </Text>
        <Text
          fontSize="md"
          color="gray.600"
          textAlign="center"
          w={{ md: "60%", base: "80%" }}
        >
          We welcome contributions from everyone! Whether you're a developer,
          designer, or just love the project, your ideas and code can help make
          it even better. Jump in and join the fun. 🎉
        </Text>
        <Button
          colorScheme="teal"
          onClick={() =>
            window.open("https://github.com/PranayD1807/Mellow-Tools", "_blank")
          }
        >
          <FaGithub /> Check it out on GitHub
        </Button>
      </VStack>
    </Flex>
  );
};

export default ContributeCard;
