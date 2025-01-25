import { Text } from "@chakra-ui/react";
import { Link } from "react-router-dom";
import { SiRetool } from "react-icons/si";

interface LogoProps {
  invert?: boolean;
}

const Logo: React.FC<LogoProps> = ({ invert = false }) => {
  return (
    <Link to="/dashboard">
      <Text
        fontSize={{ md: "3xl", base: "lg" }}
        fontFamily="'Cherry Bomb One', cursive"
        textAlign="center"
        alignItems="center"
        display="flex"
        color={invert ? "bg" : "bg.inverted"}
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
  );
};

export default Logo;
