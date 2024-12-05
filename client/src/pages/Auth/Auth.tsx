import { useEffect, useState } from "react";
import LoginForm from "./LoginForm";
import SignupForm from "./SignupForm";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { RootState } from "@/store/store";

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
      navigate("/");
    }
  }, [isLoggedIn, navigate]);

  return (
    <>
      {authMode === "LOGIN" && <LoginForm toggleAuthMode={toggleAuthMode} />}
      {authMode === "SIGNUP" && <SignupForm toggleAuthMode={toggleAuthMode} />}
    </>
  );
};

export default Auth;
