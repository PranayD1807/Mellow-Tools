import { Button } from "@/components/ui/button";
import { RootState } from "@/store/store";
import {
  Box,
  Flex,
  HStack,
  Icon,
  Separator,
  Text,
  VStack,
} from "@chakra-ui/react";
import { FaLongArrowAltDown } from "react-icons/fa";
import { useSelector } from "react-redux";
import { Link } from "react-router-dom";
import { GiClockwork } from "react-icons/gi";
import { BiCodeBlock } from "react-icons/bi";
import { AiOutlineBlock } from "react-icons/ai";
import { Avatar } from "@/components/ui/avatar";
import ContributeCard from "@/components/ContributeCard";
import Logo from "@/components/Logo";
import { showcaseInfo } from "@/models/ShowcaseInfo";
import ShowcaseCard from "@/components/ShowcaseCard";
import SEO from "@/components/SEO";

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

const testimonials = [
  {
    username: "John Doe",
    content:
      "This tool made my workflow a breeze. 🙌🔥 I can finally focus on the big picture instead of getting stuck in the small tasks. I feel like a productivity superhero now! 🦸‍♂️💪",
    avatar: "https://randomuser.me/api/portraits/men/10.jpg",
  },
  {
    username: "Jane Smith",
    content:
      "This is a total game changer! 🎮✨ It saved me HOURS of work that I would've otherwise spent struggling with spreadsheets. Now, I can breeze through my tasks like a pro. 😎👌 Would definitely recommend it to everyone! 🙏",
    avatar: "https://randomuser.me/api/portraits/women/12.jpg",
  },
  {
    username: "Alex Johnson",
    content:
      "Honestly, this is the best tool I've ever used for streamlining my work. 🚀💻 It’s simple, intuitive, and SO fast. No more wasting time on complicated setups. Now I just get things done. ✅💯",
    avatar: "https://randomuser.me/api/portraits/men/15.jpg",
  },
];

const showcaseInfos: showcaseInfo[] = [
  {
    title: "Text Templates",
    link: "/text-templates",
    previewImg: "/text-templates-preview.png",
    imgAlt: "text templates preview",
    description:
      '"Easily create, update, and manage all your text templates in one spot. Keep everything organized and at your fingertips, so you never have to search for them again!"',
  },
  {
    title: "Text Notes",
    link: "/notes",
    previewImg: "/notes-preview.png",
    imgAlt: "text notes preview",
    description:
      '"Keep all your text notes in one spot, organized, and easy to find. No more digging through random files — everything you need is just a tap away, right where it should be!"',
  },
  {
    title: "Bookmarks",
    link: "/bookmarks",
    previewImg: "/bookmarks-preview.png",
    imgAlt: "bookmarks preview",
    description:
      '"Say goodbye to endless scrolling and lost links! With your bookmarks in one beautifully organized place, every favorite site is just a click away. No more chaos, no more searching—just seamless access to everything you love!"',
  },
];

const LandingPage = () => {
  const isLoggedIn = useSelector((state: RootState) => state.user.isLoggedIn);

  return (
    <Flex direction="column" w="full" overflowX="hidden" alignItems="center">
      <SEO />
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
      {/* Bullet points */}
      <Flex gap={10} p={6} px={12} direction={{ base: "column", md: "row" }}>
        {/* Bullet Points */}
        {bulletPoints.map((point, index) => (
          <Box
            flex={1}
            key={index}
            borderRadius="xl"
            boxShadow="md"
            p={6}
            transition="all 0.3s ease"
            _hover={{ boxShadow: "xl", transform: "scale(1.05)" }}
          >
            <HStack>
              <Icon boxSize={10} mr={4}>
                {point.icon}
              </Icon>
              <Text fontWeight="bold" fontSize={{ base: "lg", md: "xl" }}>
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
      {/* Some text */}
      <Text
        mb={10}
        mt={20}
        fontSize={{ base: "lg", md: "2xl" }}
        textDecoration="underline"
        textDecorationColor="bg.emphasized"
        textDecorationThickness="0.5"
        opacity={0.6}
        textAlign="center"
        w="80%"
      >
        Check out the amazing
        <Text as="span" fontWeight="bold">
          {" features "}
        </Text>
        below that make your experience even better!
      </Text>

      {/* Text Template */}
      <ShowcaseCard info={showcaseInfos[0]} />

      {/* Notes */}
      <ShowcaseCard info={showcaseInfos[1]} />

      {/* Hold up! */}
      <Text
        mb={10}
        mt={20}
        fontSize={{ base: "lg", md: "2xl" }}
        textDecoration="underline"
        textDecorationColor="bg.emphasized"
        textDecorationThickness="0.5"
        textAlign="center"
        opacity={0.6}
      >
        Hold up! There's more!
      </Text>

      {/* Bookmarks */}
      <ShowcaseCard info={showcaseInfos[2]} />

      {/* Testimonials */}
      <Flex
        w="80%"
        my={40}
        gap={10}
        direction={{
          base: "column",
          md: "row",
        }}
      >
        <VStack py={8} justifyContent="center" flex={4}>
          <Text
            fontSize="3xl"
            fontWeight="bold"
            fontFamily="Inter"
            textAlign="center"
          >
            Don't Take Our Word for It…
          </Text>
          <Text mt={2} opacity={0.6} fontSize="xl" p={2} textAlign="center">
            "Okay, okay, we get it. You've seen a million testimonials like
            these, right? 😅 But hey, maybe these might just be real... or maybe
            they're as fictional as that perfect pizza delivery time. 🍕 But who
            needs to be serious all the time? Enjoy the laughs and see what we
            think of the tools—whether it's real or not, we're here to keep it
            fun! 😎"
          </Text>
        </VStack>
        <VStack flex={5}>
          {testimonials.map((el, index) => (
            <Box
              key={index}
              borderRadius="lg"
              boxShadow="md"
              bg={index == 1 ? "bg.inverted" : ""}
              p={6}
              mb={4}
              _hover={{ boxShadow: "xl", transform: "scale(1.05)" }}
              transition="all 0.3s ease"
            >
              <HStack gap={4} alignItems="stretch">
                <Avatar src={el.avatar} size="md" />
                <VStack align="start">
                  <Text
                    fontWeight="bold"
                    fontSize="lg"
                    color={index == 1 ? "bg" : ""}
                  >
                    {el.username}
                  </Text>
                  <Text
                    fontSize="sm"
                    color={index == 1 ? "bg" : ""}
                    opacity={0.6}
                  >
                    {el.content}
                  </Text>
                </VStack>
              </HStack>
            </Box>
          ))}
        </VStack>
      </Flex>

      {/* Contribute */}

      <ContributeCard />

      {/* Footer */}
      <Flex
        mt={10}
        w="100%"
        bg="bg.inverted"
        py={10}
        justifyContent="center"
        alignItems="center"
        direction="column"
      >
        <VStack alignItems="start" w="80%">
          <Logo invert={true} />
          <Text color="bg">
            Mellow Tools - A collection of friendly, useful tools like text
            templates, notes, and more to enhance your productivity
            effortlessly.
          </Text>
          <Separator opacity={0.6} my={4} />
        </VStack>
        <Flex
          justifyContent="space-between"
          w="80%"
          gap={4}
          direction={{
            base: "column",
            md: "row",
          }}
        >
          <Text color="bg" fontSize="sm" opacity={0.6}>
            © 2025 Pranay Dhongade. All rights reserved.
          </Text>
          <Text color="bg" fontSize="sm">
            {"Made with ❤️ by "}
            <Link
              to="https://pranaydhongade.site/"
              target="_blank"
              rel="noopener noreferrer"
            >
              <Text as="span" textDecoration="underline">
                Pranay Dhongade
              </Text>
            </Link>
          </Text>
        </Flex>
      </Flex>
    </Flex>
  );
};

export default LandingPage;
