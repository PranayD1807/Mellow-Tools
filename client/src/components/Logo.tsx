import { Box, Text } from "@chakra-ui/react";
import { Link } from "react-router-dom";
import { SiRetool } from "react-icons/si";

const Logo: React.FC = () => {
  return (
    <Box>
      <Link to="/dashboard">
        {/* <Image src="/logo.png" alt="Logo" h="40px"></Image> */}
        <Text
          fontSize="3xl"
          fontFamily="'Cherry Bomb One', cursive"
          textAlign="center"
          alignItems="center"
          display="flex"
        >
          <SiRetool
            style={{
              display: "inline",
              margin: "0px 15px 0px 0px",
            }}
          />
          Mellow Tools
        </Text>
      </Link>
    </Box>
  );
};

export default Logo;
