import { HStack, IconButton, useBreakpointValue } from "@chakra-ui/react";
import { chakra } from "@chakra-ui/react";
import {
  ColorModeButton,
  ColorModeIcon,
} from "@/components/ui/color-mode";
import { useColorMode } from "@/hooks/ui/use-color-mode";

import { useDispatch, useSelector } from "react-redux";
import { logout } from "@/store/userSlice";
import { Button } from "@/components/ui/button";
import {
  MenuContent,
  MenuItem,
  MenuRoot,
  MenuTrigger,
} from "@/components/ui/menu";

import { FiLogOut, FiMenu, FiUser } from "react-icons/fi";
import { RootState } from "@/store/store";
import Logo from "./Logo";
import { useLocation, useNavigate } from "react-router-dom";
import { IoChevronBackOutline } from "react-icons/io5";
import { Link } from "react-router-dom";
import { GiDeathcab } from "react-icons/gi";
import ProfileDrawer from "./ProfileDrawer";
import { useState } from "react";

const Header = () => {
  const isLoggedIn = useSelector((state: RootState) => state.user.isLoggedIn);
  const dispatch = useDispatch();
  const { toggleColorMode, colorMode } = useColorMode();
  const location = useLocation();
  const navigate = useNavigate();
  const [profileOpen, setProfileOpen] = useState(false);

  // Handle logout
  const handleLogout = () => {
    dispatch(logout());
  };

  const handleBack = () => {
    const path = location.pathname;

    if (path.startsWith("/text-templates/")) {
      navigate("/text-templates");
    } else if (
      [
        "/text-templates",
        "/notes",
        "/bookmarks",
        "/job-tracker",
        "/update-password",
        "/dashboard",
        "/2fa",
      ].includes(path)
    ) {
      if (path === "/dashboard") {
        navigate("/");
      } else {
        navigate("/dashboard");
      }
    } else {
      navigate(-1);
    }
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
      bgColor="Background"
    >
      <HStack gap={4}>
        {location.pathname != "/" && location.pathname != "/auth" && (
          <IconButton onClick={handleBack} variant="outline">
            <IoChevronBackOutline />
          </IconButton>
        )}
        {/* logo */}
        <Logo />
      </HStack>

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
              <>
                <MenuItem
                  value="profile"
                  onClick={() => setProfileOpen(true)}
                  data-testid="profile-menu-item"
                >
                  <FiUser />
                  Profile
                </MenuItem>
                <MenuItem value="log-out" onClick={handleLogout}>
                  <FiLogOut />
                  Logout
                </MenuItem>
              </>
            )}
          </MenuContent>
        </MenuRoot>
      ) : (
        <HStack gap={4}>
          <ColorModeButton variant="outline" h={10} w={10} />
          {isLoggedIn && location.pathname != "/" && (
            <>
              <Button
                variant="outline"
                onClick={() => setProfileOpen(true)}
                data-testid="profile-button"
              >
                <FiUser />
              </Button>
              <Button variant="outline" h={10} onClick={handleLogout}>
                <FiLogOut />
                Log Out
              </Button>
            </>
          )}
          {location.pathname == "/" && (
            <Link to={isLoggedIn ? "/dashboard" : "/auth"}>
              <Button variant="solid" h={10} borderRadius="3xl">
                <GiDeathcab /> Get Started
              </Button>
            </Link>
          )}
        </HStack>
      )}
      <ProfileDrawer
        open={profileOpen}
        onOpenChange={(e) => setProfileOpen(e.open)}
      />
    </chakra.header>
  );
};

export default Header;
