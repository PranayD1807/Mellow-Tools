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

// Password Strength function (all factors required)
const calculatePasswordStrength = (password: string): number => {
  let strength = 0;
  if (password.length >= 8) strength++; // Length must be 8+
  if (password.match(/[a-z]/)) strength++; // Must contain lowercase
  if (password.match(/[A-Z]/)) strength++; // Must contain uppercase
  if (password.match(/[0-9]/)) strength++; // Must contain number
  if (password.match(/[@$!%*?&]/)) strength++; // Must contain special character

  return strength; // returns a value between 0 and 5
};

// Validation function
const validate = (values: { email: string; password: string }) => {
  const errors: { email?: string; password?: string } = {};

  // Email Validation
  if (!values.email) {
    errors.email = "Email is required";
  } else if (!/\S+@\S+\.\S+/.test(values.email)) {
    errors.email = "Please enter a valid email address";
  }

  // Password Validation
  if (!values.password) {
    errors.password = "Password is required";
  } else {
    const passwordStrength = calculatePasswordStrength(values.password);

    // Check for password length
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
  const dispatch = useDispatch();

  const onSubmit = async (
    values: { email: string; password: string },
    actions: FormikHelpers<{ email: string; password: string }>
  ) => {
    actions.setSubmitting(true);
    try {
      const res = await userApi.signin(values);
      if (res.err) {
        toast.error(res.err.message);
      } else if (res.data) {
        const userData = res.data.data;
        dispatch(
          login({
            displayName: userData.displayName,
            email: userData.email,
            userId: userData.id,
          })
        );
        localStorage.setItem("actkn", res.data.token);
        toast.success(res.data.message);
      }
    } catch (error) {
      console.log(error);
      toast.error("Something went wrong");
    } finally {
      actions.setSubmitting(false);
    }
  };

  // Handle password strength calculation
  const handlePasswordChange = (password: string) => {
    setPasswordStrength(calculatePasswordStrength(password));
  };

  // Conditional image display for large screens
  const showImage = useBreakpointValue({ base: false, md: true }); // Show on md and larger screens

  return (
    <Flex align="center" justify="center" mt={10}>
      <Box
        display="flex"
        flexDirection={{ base: "column", md: "row" }} // Stack vertically on small screens, row on larger
        p={8}
        gap={4}
        rounded="md"
        w={useBreakpointValue({ base: "90%", sm: "80%", md: "70%" })}
        boxShadow="md"
        alignItems="center"
        justifyContent="center"
      >
        {/* Image or content on the left (visible on md and larger screens) */}
        {showImage && (
          <Box
            w={{ base: "0", md: "40%" }} // Hide on mobile (base), show on medium screens (md)
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
          w={{ base: "100%", md: "60%" }}
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
            validate={validate} // using the extracted validate function
            onSubmit={onSubmit} // using the extracted onSubmit function
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
                  {/* Email Field */}
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

                  {/* Password Field */}
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
                        handlePasswordChange(e.target.value); // update password strength
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
