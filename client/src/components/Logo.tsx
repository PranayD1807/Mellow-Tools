import { Box, Image } from "@chakra-ui/react";
import { Link } from "react-router-dom";

const Logo: React.FC = () => {
  return (
    <Box>
      <Link to="/">
        <Image src="/logo.png" alt="Logo" h="40px"></Image>
      </Link>
    </Box>
  );
};

export default Logo;
