import { Button } from "@/components/ui/button";
import { RootState } from "@/store/store";
import {
  Box,
  Flex,
  HStack,
  Icon,
  Image,
  Separator,
  Text,
} from "@chakra-ui/react";
import { FaLongArrowAltDown } from "react-icons/fa";
import { useSelector } from "react-redux";
import { Link } from "react-router-dom";
import { GiClockwork } from "react-icons/gi";
import { BiCodeBlock } from "react-icons/bi";
import { AiOutlineBlock } from "react-icons/ai";

const bulletPoints = [
  {
    label: "Get Stuff Done",
    description:
      "Smash through your tasks faster than ever with tools that keep you on top of your game.",
    icon: <GiClockwork />,
  },
  {
    label: "So Easy, It's Fun",
    description:
      "No manuals needed! Dive in and enjoy tools that just make sense, no matter your skill level.",
    icon: <AiOutlineBlock />,
  },
  {
    label: "Open for All",
    description:
      "Peek under the hood, tweak it, or make it your own—this is tech for everyone to build on.",
    icon: <BiCodeBlock />,
  },
];

const LandingPage = () => {
  const isLoggedIn = useSelector((state: RootState) => state.user.isLoggedIn);

  return (
    <Flex direction="column" w="full" overflowX="hidden" alignItems="center">
      {/* Introduction */}
      <Flex
        overflow="hidden"
        h="90vh"
        w="100vw"
        alignItems="center"
        justifyContent="center"
        direction="column"
      >
        <Text
          w={{ base: "80%", md: "60%" }}
          textAlign="center"
          fontSize={{ base: "4xl", md: "6xl" }}
          my="20px"
          fontFamily="inter"
          fontWeight="bold"
          opacity={0.8}
        >
          Simple Tools, Big Impact.
        </Text>
        <Text
          w={{ base: "80%", md: "60%" }}
          fontSize="lg"
          textAlign="center"
          opacity={0.6}
        >
          "Welcome to Mellow Tools - a platform crafted out of a passion for
          simplifying digital workflows. My goal is to provide intuitive,
          user-friendly tools that help developers, designers, and tech
          enthusiasts alike streamline their tasks, enhance productivity, and
          focus on what truly matters. Mellow Tools is here to make your digital
          journey smoother and more efficient."
        </Text>
        <Link to={isLoggedIn ? "/dashboard" : "/auth"}>
          <Button variant="subtle" h={10} m={8} borderRadius="3xl" px={8}>
            Get Started
          </Button>
        </Link>
        <Text
          fontSize="sm"
          opacity={0.7}
          textAlign="center"
          display="flex"
          flexDirection="column"
          alignItems="center"
        >
          Learn more
          <FaLongArrowAltDown />
        </Text>
      </Flex>
      <Flex gap={10} p={6} px={12} direction={{ base: "column", md: "row" }}>
        {/* Bullet Points */}
        {bulletPoints.map((point, index) => (
          <Box flex={1} key={index} borderRadius="xl" boxShadow="md" p={6}>
            <HStack>
              <Icon boxSize={10} mr={4}>
                {point.icon}
              </Icon>
              <Text fontWeight="bold" fontSize="xl">
                {point.label}
              </Text>
            </HStack>
            <Separator my={4} />
            <Text fontSize="md" opacity={0.6} textAlign="left">
              {point.description}
            </Text>
          </Box>
        ))}
      </Flex>
      <Text
        mb={10}
        mt={20}
        fontSize="2xl"
        textDecoration="underline"
        textDecorationColor="bg.emphasized"
        textDecorationThickness="0.5"
        opacity={0.6}
      >
        Check out the amazing
        <Text as="span" fontWeight="bold">
          {" features "}
        </Text>
        below that make your experience even better!
      </Text>

      {/* Text Template */}
      <Flex
        w="80%"
        borderRadius="xl"
        boxShadow="md"
        direction="column"
        p={8}
        alignItems="center"
        mt={8}
      >
        <Text
          fontSize="3xl"
          fontWeight="bold"
          fontFamily="Inter"
          w="80%"
          textAlign="center"
        >
          Text Templates
        </Text>
        <Text mt={2} opacity={0.6} fontSize="xl" w="80%" textAlign="center">
          "Easily create, update, and manage all your text templates in one
          spot. Keep everything organized and at your fingertips, so you never
          have to search for them again!"
        </Text>
        <Link to="/text-templates">
          <Button variant="subtle" h={10} m={8} borderRadius="3xl" px={8}>
            Try it out!
          </Button>
        </Link>
        <Image
          boxShadow="md"
          borderRadius="xl"
          src="/text-templates-preview.png"
          w="80%"
          alt="text templates preview"
        />
      </Flex>

      {/* Hold up! */}
      <Text
        mb={10}
        mt={20}
        fontSize="2xl"
        textDecoration="underline"
        textDecorationColor="bg.emphasized"
        textDecorationThickness="0.5"
        opacity={0.6}
      >
        Hold up! There's more!
      </Text>

      {/* Notes */}
      <Flex
        w="80%"
        borderRadius="xl"
        boxShadow="md"
        direction="column"
        p={8}
        alignItems="center"
        mt={8}
      >
        <Text
          fontSize="3xl"
          fontWeight="bold"
          fontFamily="Inter"
          w="80%"
          textAlign="center"
        >
          Text Notes
        </Text>
        <Text mt={2} opacity={0.6} fontSize="xl" w="80%" textAlign="center">
          "We know you've been needing this! Keep all your text notes in one
          spot, organized, and easy to find. No more digging through random
          files — everything you need is just a tap away, right where it should
          be!"
        </Text>
        <Link to="/notes">
          <Button variant="subtle" h={10} m={8} borderRadius="3xl" px={8}>
            Try it out!
          </Button>
        </Link>
        <Image
          boxShadow="md"
          borderRadius="xl"
          src="/notes-preview.png"
          w="80%"
          alt="text notes preview"
        />
      </Flex>
    </Flex>
  );
};

export default LandingPage;
