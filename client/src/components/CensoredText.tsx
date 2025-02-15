import { Box } from "@chakra-ui/react";
import { ReactNode } from "react";

interface CensoredTextProps {
  children: ReactNode;
  revealed: boolean;
}

const CensoredText: React.FC<CensoredTextProps> = ({ children, revealed }) => {
  return (
    <Box position="relative" w="full" overflowY="auto">
      <Box
        _before={{
          content: '""',
          position: "absolute",
          top: 0,
          left: 0,
          w: "100%",
          h: "100%",
          bg: revealed ? "transparent" : "bg.emphasized",
          color: revealed ? "transparent" : "bg.inverted",
          textAlign: "center",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          transition: "all 0.3s ease",
          borderRadius: "md",
          pointerEvents: revealed ? "none" : "auto",
        }}
        position="relative"
      >
        {children}
      </Box>
    </Box>
  );
};

export default CensoredText;
