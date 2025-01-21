import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { RootState } from "@/store/store";
import LoginForm from "./LoginForm";
import SignupForm from "./SignupForm";
import { Helmet } from "react-helmet-async"; // Import Helmet

const Auth = () => {
  // authMode : LOGIN || SIGNUP
  const [authMode, setAuthMode] = useState<"LOGIN" | "SIGNUP">("LOGIN");

  const toggleAuthMode = () => {
    setAuthMode((prevMode) => (prevMode === "LOGIN" ? "SIGNUP" : "LOGIN"));
  };

  const navigate = useNavigate();
  const isLoggedIn = useSelector((state: RootState) => state.user.isLoggedIn);

  useEffect(() => {
    if (isLoggedIn) {
      navigate("/dashboard");
    }
  }, [isLoggedIn, navigate]);

  return (
    <>
      <Helmet>
        <title>
          {authMode === "LOGIN"
            ? "Login to Mellow Tools"
            : "Sign Up for Mellow Tools"}
        </title>
        <meta
          name="description"
          content={
            authMode === "LOGIN"
              ? "Login to your Mellow Tools account to access all the features and boost your productivity."
              : "Sign up for Mellow Tools and unlock all the tools to enhance your productivity and workflow."
          }
        />
        <meta
          property="og:title"
          content={
            authMode === "LOGIN"
              ? "Login to Mellow Tools"
              : "Sign Up for Mellow Tools"
          }
        />
        <meta
          property="og:description"
          content={
            authMode === "LOGIN"
              ? "Login to your Mellow Tools account to access all the features and boost your productivity."
              : "Sign up for Mellow Tools and unlock all the tools to enhance your productivity and workflow."
          }
        />
        <meta property="og:type" content="website" />
        <meta property="og:image" content="/og-image.png" />
      </Helmet>
      {authMode === "LOGIN" && <LoginForm toggleAuthMode={toggleAuthMode} />}
      {authMode === "SIGNUP" && <SignupForm toggleAuthMode={toggleAuthMode} />}
    </>
  );
};

export default Auth;
