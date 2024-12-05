import { HStack, useBreakpointValue } from "@chakra-ui/react";
import { chakra } from "@chakra-ui/react";
import {
  ColorModeButton,
  ColorModeIcon,
  useColorMode,
} from "@/components/ui/color-mode";

import { useDispatch, useSelector } from "react-redux";
import { logout } from "@/store/userSlice";
import { Button } from "@/components/ui/button";
import {
  MenuContent,
  MenuItem,
  MenuRoot,
  MenuTrigger,
} from "@/components/ui/menu";

// icons
import { FiLogOut, FiMenu } from "react-icons/fi";
import { RootState } from "@/store/store";
import Logo from "./Logo";

const Header = () => {
  const isLoggedIn = useSelector((state: RootState) => state.user.isLoggedIn);
  const dispatch = useDispatch();
  const { toggleColorMode, colorMode } = useColorMode();

  // Handle logout
  const handleLogout = () => {
    dispatch(logout());
  };

  // Determine whether to show the menu (mobile) or full buttons (desktop)
  const showMenu = useBreakpointValue({ base: true, md: false }); // true for mobile, false for desktop

  return (
    <chakra.header
      display="flex"
      flexDirection="row"
      alignItems="center"
      justifyContent="space-between"
      px={8}
      py={4}
      boxShadow="md"
      bg="surface"
    >
      {/* logo */}
      <Logo />

      {/* Buttons or Menu based on viewport */}
      {showMenu ? (
        <MenuRoot>
          <MenuTrigger asChild>
            <Button variant="outline" size="sm">
              <FiMenu />
            </Button>
          </MenuTrigger>
          <MenuContent>
            <MenuItem value="theme" onClick={toggleColorMode}>
              <ColorModeIcon />
              {colorMode === "light" ? "Dark Mode" : "Light Mode"}
            </MenuItem>
            {isLoggedIn && (
              <MenuItem value="log-out" onClick={handleLogout}>
                <FiLogOut />
                Logout
              </MenuItem>
            )}
          </MenuContent>
        </MenuRoot>
      ) : (
        <HStack gap={4}>
          <ColorModeButton variant="outline" h={10} w={10} />
          {isLoggedIn && (
            <Button variant="outline" h={10} onClick={handleLogout}>
              <FiLogOut />
              Log Out
            </Button>
          )}
        </HStack>
      )}
    </chakra.header>
  );
};

export default Header;
