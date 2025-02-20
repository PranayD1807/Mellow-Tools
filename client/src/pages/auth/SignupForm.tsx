import React, { useState } from "react";
import {
  Box,
  Flex,
  VStack,
  Text,
  Input,
  Heading,
  useBreakpointValue,
  Grid,
  Separator,
} from "@chakra-ui/react";
import { Button } from "@/components/ui/button";
import {
  PasswordInput,
  PasswordStrengthMeter,
} from "@/components/ui/password-input";
import { Field } from "@/components/ui/field";
import { Formik, Field as FormikField, FormikHelpers } from "formik";
import { useDispatch } from "react-redux";
import { toast } from "react-toastify";
import userApi from "@/api/modules/user.api";
import { login } from "@/store/userSlice";
import Encryption from "@/helper/encryption.helper";
import { LocalStorageHelper } from "@/helper/localStorage.helper";

const calculatePasswordStrength = (password: string): number => {
  let strength = 0;
  if (password.length >= 8) strength++;
  if (/[a-z]/.test(password)) strength++;
  if (/[A-Z]/.test(password)) strength++;
  if (/[0-9]/.test(password)) strength++;
  if (/[@$!%*?&]/.test(password)) strength++;
  return strength;
};

const SignupForm: React.FC<{ toggleAuthMode: () => void }> = ({
  toggleAuthMode,
}) => {
  const [passwordStrength, setPasswordStrength] = useState(0);
  const dispatch = useDispatch();

  const onSubmit = async (
    values: {
      email: string;
      displayName: string;
      password: string;
      confirmPassword: string;
    },
    actions: FormikHelpers<{
      email: string;
      displayName: string;
      password: string;
      confirmPassword: string;
    }>
  ) => {
    actions.setSubmitting(true);
    try {
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

      const res = await userApi.signup({
        ...values,
        encryptedAESKey,
        passwordKeySalt,
      });
      if (res.status === "error") {
        toast.error(res.err?.message || "Something went wrong");
      } else if (res.data) {
        const userData = res.data.data;
        dispatch(
          login({
            displayName: userData.displayName,
            email: userData.email,
            userId: userData.id,
          })
        );
        LocalStorageHelper.saveUserCreds({
          userInfo: userData,
          password: values.password,
          jwtToken: res.data.token,
        });
        toast.success(res.data.message);
      }
    } catch (error) {
      console.error(error);
      toast.error("Something went wrong");
    } finally {
      actions.setSubmitting(false);
    }
  };

  return (
    <Flex align="center" justify="center" mt={10}>
      <Box
        display="flex"
        flexDirection="column"
        p={8}
        gap={4}
        rounded="md"
        w={useBreakpointValue({ base: "90%", sm: "80%", md: "70%" })}
        boxShadow="md"
        alignItems="center"
        justifyContent="center"
      >
        <Heading fontSize="2xl" textAlign="center">
          Create an Account 🎉
        </Heading>
        <Separator size="sm" marginBottom="10px" px={10} w="40%" />

        <Formik
          initialValues={{
            email: "",
            displayName: "",
            password: "",
            confirmPassword: "",
          }}
          onSubmit={onSubmit}
        >
          {({ handleSubmit, values, handleChange, isSubmitting }) => (
            <form style={{ width: "100%" }} onSubmit={handleSubmit}>
              <VStack gap="20px" align="stretch">
                <Grid templateColumns={["1fr", "1fr 1fr"]} gap={4}>
                  <Field label="Full Name" required>
                    <FormikField
                      name="displayName"
                      as={Input}
                      placeholder="Your Name"
                      variant="outline"
                      onChange={handleChange}
                      value={values.displayName}
                    />
                  </Field>
                  <Field label="Email" required>
                    <FormikField
                      name="email"
                      as={Input}
                      placeholder="me@example.com"
                      variant="outline"
                      onChange={handleChange}
                      value={values.email}
                    />
                  </Field>
                  <Field label="Password" required>
                    <FormikField
                      name="password"
                      as={PasswordInput}
                      placeholder="Enter your password"
                      variant="outline"
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                        handleChange(e);
                        setPasswordStrength(
                          calculatePasswordStrength(e.target.value)
                        );
                      }}
                      value={values.password}
                    />
                    <PasswordStrengthMeter
                      marginTop="5px"
                      value={passwordStrength}
                      minWidth="40%"
                    />
                  </Field>
                  <Field label="Confirm Password" required>
                    <FormikField
                      name="confirmPassword"
                      as={PasswordInput}
                      placeholder="Confirm your password"
                      variant="outline"
                      onChange={handleChange}
                      value={values.confirmPassword}
                    />
                  </Field>
                </Grid>
                <Button
                  colorScheme="blue"
                  type="submit"
                  width={{ base: "100%", md: "80%", lg: "60%" }}
                  loading={isSubmitting}
                  loadingText="Signing up..."
                  disabled={passwordStrength < 5}
                  margin="auto"
                  marginTop={4}
                >
                  Sign Up
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
          Already have an account?
          <Button onClick={toggleAuthMode} variant="subtle">
            Login
          </Button>
        </Text>
      </Box>
    </Flex>
  );
};

export default SignupForm;
