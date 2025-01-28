import { Image, Text, VStack } from "@chakra-ui/react";

interface Props {
  text: string;
}

const NoItems: React.FC<Props> = ({ text }) => {
  return (
    <VStack h="60vh" justifyContent="center" alignItems="center" w="full">
      <Image w={{ base: "50%", md: "200px" }} src="/no-items.png" />
      <Text
        textAlign="center"
        fontSize={{
          base: "md",
          md: "lg",
        }}
        w={{
          base: "80%",
          md: "60%",
        }}
      >
        "Oops, no data here! 😴 Mellow is taking a nap while waiting for some
        {` ${text} `} to appear. Don't let it sleep too long - click the add
        button to create something new!"
      </Text>
    </VStack>
  );
};

export default NoItems;
