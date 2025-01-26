import { showcaseInfo } from "@/models/ShowcaseInfo";
import { Flex, Button, Text, Image } from "@chakra-ui/react";
import { Link } from "react-router-dom";

const ShowcaseCard = ({ info }: { info: showcaseInfo }) => {
  return (
    <Flex
      w="80%"
      borderRadius="xl"
      boxShadow="md"
      direction="column"
      p={8}
      alignItems="center"
      mt={8}
      bg="bg.subtle"
    >
      <Text
        fontSize={{ base: "xl", md: "3xl" }}
        fontWeight="bold"
        fontFamily="Inter"
        w="80%"
        textAlign="center"
      >
        {info.title}
      </Text>
      <Text
        mt={2}
        opacity={0.6}
        fontSize={{ base: "md", md: "xl" }}
        w="80%"
        textAlign="center"
      >
        {info.description}
      </Text>
      <Link to={info.link}>
        <Button variant="subtle" h={10} m={8} borderRadius="3xl" px={8}>
          Try it out!
        </Button>
      </Link>
      <Image
        boxShadow="md"
        borderRadius="xl"
        src={info.previewImg}
        w={{ md: "80%", base: "100%" }}
        _hover={{ boxShadow: "xl", transform: "scale(1.05)" }}
        transition="all 0.3s ease"
        alt={info.imgAlt}
      />
    </Flex>
  );
};

export default ShowcaseCard;
