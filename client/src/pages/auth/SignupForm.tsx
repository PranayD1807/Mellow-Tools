import React, { useState } from "react";
import {
  Box,
  Flex,
  VStack,
  HStack,
  Text,
  Input,
  Heading,
  useBreakpointValue,
  Grid,
  Separator,
  Icon,
} from "@chakra-ui/react";
import { LuCheck, LuCircle } from "react-icons/lu";
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

const checkPasswordStrength = (password: string) => {
  const criteria = [
    { label: "At least 8 characters", met: password.length >= 8 },
    { label: "Contains lowercase letter", met: /[a-z]/.test(password) },
    { label: "Contains uppercase letter", met: /[A-Z]/.test(password) },
    { label: "Contains number", met: /[0-9]/.test(password) },
    {
      label: "Contains special character (@$!%*?&#^)",
      met: /[@$!%*?&#^]/.test(password),
    },
  ];
  const score = criteria.filter((c) => c.met).length;
  return { score, criteria };
};

const SignupForm: React.FC<{ toggleAuthMode: () => void }> = ({
  toggleAuthMode,
}) => {
  const [passwordStrength, setPasswordStrength] = useState(
    checkPasswordStrength("")
  );
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
      if (values.password !== values.confirmPassword) {
        toast.error("Passwords do not match");
        actions.setSubmitting(false);
        return;
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
            encryptionStatus: userData.encryptionStatus,
          })
        );
        await LocalStorageHelper.saveUserCreds({
          userInfo: userData,
          password: values.password,
          jwtToken: res.data.token,
          refreshToken: res.data.refreshToken,
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
                      autoComplete="name"
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
                      autoComplete="username"
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
                      autoComplete="new-password"
                      placeholder="Enter your password"
                      variant="outline"
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                        handleChange(e);
                        setPasswordStrength(
                          checkPasswordStrength(e.target.value)
                        );
                      }}
                      value={values.password}
                    />
                    <PasswordStrengthMeter
                      marginTop="5px"
                      value={passwordStrength.score}
                      minWidth="40%"
                    />
                    <VStack align="start" gap={1} mt={2}>
                      {passwordStrength.criteria.map((criterion, index) => (
                        <HStack key={index} gap={2}>
                          <Icon
                            as={criterion.met ? LuCheck : LuCircle}
                            color={criterion.met ? "green.500" : "gray.300"}
                            boxSize={3}
                          />
                          <Text
                            fontSize="xs"
                            color={criterion.met ? "green.500" : "gray.500"}
                          >
                            {criterion.label}
                          </Text>
                        </HStack>
                      ))}
                    </VStack>
                  </Field>
                  <Field label="Confirm Password" required>
                    <FormikField
                      name="confirmPassword"
                      as={PasswordInput}
                      autoComplete="new-password"
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
                  disabled={passwordStrength.score < 5}
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
