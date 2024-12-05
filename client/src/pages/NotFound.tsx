import { Box, Text, Center, Button } from "@chakra-ui/react";
import { useNavigate } from "react-router-dom";

const NotFound = () => {
  const navigate = useNavigate();

  return (
    <Center h="100vh" flexDirection="column" textAlign="center">
      <Box>
        <Text fontSize="4xl" mb={4} fontWeight="bold">
          😕 Whoops! 😕
          <br />
          Looks like you've wandered off the map...
        </Text>

        <Button colorScheme="blue" size="lg" onClick={() => navigate("/")}>
          Go Home
        </Button>
      </Box>
    </Center>
  );
};

export default NotFound;
