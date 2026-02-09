import {
  Box,
  Flex,
  VStack,
  Text,
  Input,
  Heading,
  useBreakpointValue,
  Image,
  Separator,
} from "@chakra-ui/react";

import { Button } from "@/components/ui/button";

import {
  PasswordInput,
  PasswordStrengthMeter,
} from "@/components/ui/password-input";
import { Field } from "@/components/ui/field";
import React, { useState } from "react";
import { Formik, Field as FormikField, FormikHelpers } from "formik";
import userApi from "@/api/modules/user.api";
import { useDispatch } from "react-redux";
import { login } from "@/store/userSlice";
import { toast } from "react-toastify";
import { LocalStorageHelper } from "@/helper/localStorage.helper";
import Encryption from "@/helper/encryption.helper";


const calculatePasswordStrength = (password: string): number => {
  let strength = 0;
  if (password.length >= 8) strength++; // Length must be 8+
  if (password.match(/[a-z]/)) strength++; // Must contain lowercase
  if (password.match(/[A-Z]/)) strength++; // Must contain uppercase
  if (password.match(/[0-9]/)) strength++; // Must contain number
  if (password.match(/[@$!%*?&]/)) strength++; // Must contain special character


  return strength;
};


const validate = (values: { email: string; password: string }) => {
  const errors: { email?: string; password?: string } = {};


  if (!values.email) {
    errors.email = "Email is required";
  } else if (!/\S+@\S+\.\S+/.test(values.email)) {
    errors.email = "Please enter a valid email address";
  }


  if (!values.password) {
    errors.password = "Password is required";
  } else {
    const passwordStrength = calculatePasswordStrength(values.password);


    if (values.password.length < 8) {
      errors.password = "Password must be at least 8 characters long";
    }
    // Check for at least one lowercase letter
    else if (!/[a-z]/.test(values.password)) {
      errors.password = "Password must contain at least one lowercase letter";
    }
    // Check for at least one uppercase letter
    else if (!/[A-Z]/.test(values.password)) {
      errors.password = "Password must contain at least one uppercase letter";
    }
    // Check for at least one number
    else if (!/[0-9]/.test(values.password)) {
      errors.password = "Password must contain at least one number";
    }
    // Check for at least one special character
    else if (!/[@$!%*?&]/.test(values.password)) {
      errors.password = "Password must contain at least one special character";
    }
    // Overall strength check
    else if (passwordStrength < 5) {
      errors.password = "Password must meet all the strength requirements.";
    }
  }

  return errors;
};

const LoginForm: React.FC<{ toggleAuthMode: () => void }> = ({
  toggleAuthMode,
}) => {
  const [passwordStrength, setPasswordStrength] = useState(0);
  const [is2FARequired, setIs2FARequired] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [password, setPassword] = useState("");

  const dispatch = useDispatch();

  const handle2FASubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userId || !otp) return;
    setLoading(true);

    try {
      const res = await userApi.validate2FA(userId, otp);
      setLoading(false);

      if (res.status === "error") {
        toast.error(res.err?.message || "Invalid code");
      } else if (res.data) {
        const userData = res.data.data!;

        dispatch(
          login({
            displayName: userData.displayName,
            email: userData.email,
            userId: userData.id,
            encryptionStatus: userData.encryptionStatus,
          })
        );
        localStorage.setItem("actkn", res.data.token);
        localStorage.setItem("refreshToken", res.data.refreshToken);

        LocalStorageHelper.saveUserCreds({
          userInfo: userData,
          password: password,
          jwtToken: res.data.token,
          refreshToken: res.data.refreshToken,
        });

        toast.success("Login successful!");
      }
    } catch (_) {
      setLoading(false);
      toast.error("An error occurred");
    }
  };

  const onSubmit = async (
    values: { email: string; password: string },
    actions: FormikHelpers<{ email: string; password: string }>
  ) => {
    actions.setSubmitting(true);
    try {
      const res = await userApi.signin(values);

      if (res.status === "error") {
        toast.error(res.err?.message || "Something went wrong");
      } else if (res.status === "2fa_required" && res.data?.userId) {
        setIs2FARequired(true);
        setUserId(res.data.userId || null);
        setPassword(values.password);
        toast.info("Two-Factor Authentication Required");
      } else if (res.data) {
        const userData = res.data.data!;
        if (
          !userData.encryptedAESKey &&
          !userData.passwordKeySalt
        ) {

          try {

            if (res.data.token) {
              localStorage.setItem("actkn", res.data.token);
              localStorage.setItem("refreshToken", res.data.refreshToken || "");
            }

            const freshlyGeneratedAESKey = await Encryption.generateAESKey();
            const passwordKeySalt = Encryption.generatePasswordKeySalt();
            const passwordDerivedKey = await Encryption.getPasswordDerivedKey(
              values.password,
              passwordKeySalt
            );
            const encryptedAESKey = await Encryption.encryptAESKey(
              freshlyGeneratedAESKey,
              passwordDerivedKey
            );

            console.log("Attempting migration...");
            const migrationRes = await userApi.migrateEncryption({
              password: values.password,
              encryptedAESKey,
              passwordKeySalt,
            });
            console.log("Migration Response:", migrationRes);

            if (migrationRes.status === "error") {
              throw new Error(migrationRes.err?.message || "Migration API failed");
            }


            userData.encryptedAESKey = encryptedAESKey;
            userData.passwordKeySalt = passwordKeySalt;
            userData.encryptionStatus = "MIGRATED"; // Update status so Redux state is correct
            toast.success("Account migrated to E2E Encryption!");
          } catch (error) {
            console.error("Migration failed", error);
            toast.error("Encryption migration failed. Please contact support.");
          }
        }

        dispatch(
          login({
            displayName: userData.displayName,
            email: userData.email,
            userId: userData.id,
            encryptionStatus: userData.encryptionStatus,
          })
        );

        LocalStorageHelper.saveUserCreds({
          userInfo: userData,
          password: values.password,
          jwtToken: res.data.token,
          refreshToken: res.data.refreshToken,
        });

        toast.success(res.data.message);
      }
    } catch (error: unknown) {
      console.log(error);
      toast.error("Something went wrong");
    } finally {
      actions.setSubmitting(false);
    }
  };

  const handlePasswordChange = (password: string) => {
    setPasswordStrength(calculatePasswordStrength(password));
  };

  const showImage = useBreakpointValue({ base: false, md: true });
  const containerWidth2FA = useBreakpointValue({ base: "90%", sm: "400px" });
  const containerWidthLogin = useBreakpointValue({ base: "90%", sm: "80%", md: "70%" });
  const imageWidth = { base: "0", md: "40%" };
  const formWidth = { base: "100%", md: "60%" };


  if (is2FARequired) {
    return (
      <Flex align="center" justify="center" mt={10}>
        <Box
          p={8}
          rounded="md"
          w="100%"
          maxW={containerWidth2FA}
          boxShadow="md"
          bg="bg.surface"
        >
          <Heading fontSize="xl" textAlign="center" mb={6}>
            Two-Factor Authentication
          </Heading>
          <Text textAlign="center" mb={4} color="fg.muted">
            Enter the 6-digit code from your authenticator app.
          </Text>
          <form onSubmit={handle2FASubmit}>
            <VStack gap={4}>
              <Input
                placeholder="Enter 6-digit code"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                maxLength={6}
                textAlign="center"
                fontSize="lg"
                letterSpacing="widest"
              />
              <Button
                type="submit"
                width="full"
                colorScheme="blue"
                loading={loading}
              >
                Verify
              </Button>
              <Button
                variant="ghost"
                width="full"
                onClick={() => setIs2FARequired(false)}
              >
                Back to Login
              </Button>
            </VStack>
          </form>
        </Box>
      </Flex>
    );
  }

  return (
    <Flex align="center" justify="center" mt={10}>
      <Box
        display="flex"
        flexDirection={{ base: "column", md: "row" }}
        p={8}
        gap={4}
        rounded="md"
        w={containerWidthLogin}
        boxShadow="md"
        bg="bg.surface"
        alignItems="center"
        justifyContent="center"
      >
        {showImage && (
          <Box
            w={imageWidth}
            display="flex"
            justifyContent="center"
            alignItems="center"
            pr={4}
          >
            <Image
              src="https://i.ibb.co/TrTjNfR/pexels-cottonbro-6593754.jpg"
              alt="Welcome"
              boxSize="100%"
              height="300px"
              width="300px"
              objectFit="cover"
              borderRadius="md"
            />
          </Box>
        )}

        <Box
          w={formWidth}
          display="flex"
          flexDirection="column"
          gap="10px"
          alignItems="center"
        >
          <Heading fontSize="2xl" textAlign="center">
            Welcome Back 😁!
          </Heading>
          <Separator size="sm" marginBottom="10px" px={10} w="60%" />
          <Formik
            initialValues={{
              email: "",
              password: "",
            }}
            validate={validate}
            onSubmit={onSubmit}
          >
            {({
              handleSubmit,
              values,
              errors,
              touched,
              handleChange,
              isSubmitting,
            }) => (
              <form
                style={{
                  width: "100%",
                }}
                onSubmit={handleSubmit}
              >
                <VStack gap="20px" align="stretch">

                  <Field
                    label="Email"
                    required
                    errorText={errors.email}
                    invalid={touched.email && !!errors.email}
                  >
                    <FormikField
                      name="email"
                      as={Input}
                      placeholder="me@example.com"
                      variant="outline"
                      onChange={handleChange}
                      value={values.email}
                    />
                  </Field>


                  <Field
                    label="Password"
                    required
                    errorText={errors.password}
                    invalid={touched.password && !!errors.password}
                  >
                    <FormikField
                      name="password"
                      as={PasswordInput}
                      placeholder="Enter your password"
                      variant="outline"
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                        handleChange(e);
                        handlePasswordChange(e.target.value);
                      }}
                      value={values.password}
                    />
                    <PasswordStrengthMeter
                      marginTop="5px"
                      value={passwordStrength}
                      minWidth="40%"
                    />
                  </Field>

                  <Button
                    colorScheme="blue"
                    type="submit"
                    width="full"
                    loading={isSubmitting}
                    loadingText="Logging in..."
                    disabled={passwordStrength < 5}
                  >
                    Login
                  </Button>
                </VStack>
              </form>
            )}
          </Formik>

          <Text
            display="flex"
            flexDirection="row"
            alignItems="center"
            gap="10px"
            justifyContent="center"
            margin="20px"
            fontSize="sm"
            color="fg.muted"
          >
            Don't have an account?
            <Button onClick={toggleAuthMode} variant="subtle">
              SignUp
            </Button>
          </Text>
        </Box>
      </Box>
    </Flex>
  );
};

export default LoginForm;
