import React, { useState } from "react";
import {
    VStack,
} from "@chakra-ui/react";
import { Button } from "@/components/ui/button";
import {
    PasswordInput,
    PasswordStrengthMeter,
} from "@/components/ui/password-input";
import { Field } from "@/components/ui/field";
import { Formik, Field as FormikField, FormikHelpers } from "formik";
import { toast } from "react-toastify";
import userApi from "@/api/modules/user.api";

// Password Strength function
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
const validate = (values: {
    password: string;
    newPassword: string;
    confirmNewPassword: string;
}) => {
    const errors: {
        password?: string;
        newPassword?: string;
        confirmNewPassword?: string;
    } = {};

    // Current Password Validation
    if (!values.password) {
        errors.password = "Current password is required";
    }

    // New Password Validation
    if (!values.newPassword) {
        errors.newPassword = "New password is required";
    } else {
        const passwordStrength = calculatePasswordStrength(values.newPassword);

        if (values.newPassword.length < 8) {
            errors.newPassword = "Password must be at least 8 characters long";
        } else if (!/[a-z]/.test(values.newPassword)) {
            errors.newPassword = "Password must contain at least one lowercase letter";
        } else if (!/[A-Z]/.test(values.newPassword)) {
            errors.newPassword = "Password must contain at least one uppercase letter";
        } else if (!/[0-9]/.test(values.newPassword)) {
            errors.newPassword = "Password must contain at least one number";
        } else if (!/[@$!%*?&]/.test(values.newPassword)) {
            errors.newPassword = "Password must contain at least one special character";
        } else if (passwordStrength < 5) {
            errors.newPassword = "Password must meet all the strength requirements.";
        }
    }

    // Confirm Password Validation
    if (values.confirmNewPassword !== values.newPassword) {
        errors.confirmNewPassword = "Passwords do not match";
    }

    return errors;
};

const UpdatePasswordForm = () => {
    const [passwordStrength, setPasswordStrength] = useState(0);

    const onSubmit = async (
        values: {
            password: string;
            newPassword: string;
            confirmNewPassword: string;
        },
        actions: FormikHelpers<{
            password: string;
            newPassword: string;
            confirmNewPassword: string;
        }>
    ) => {
        actions.setSubmitting(true);
        try {
            const res = await userApi.passwordUpdate(values);

            if (res.status === "error") {
                toast.error(res.err?.message || "Something went wrong");
            } else if (res.data) {
                toast.success(res.data.message);
                actions.resetForm();
                setPasswordStrength(0);
            }
        } catch (error: unknown) {
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

    return (
        <Formik
            initialValues={{
                password: "",
                newPassword: "",
                confirmNewPassword: "",
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
                <form style={{ width: "100%" }} onSubmit={handleSubmit}>
                    <VStack gap="20px" align="stretch">
                        {/* Current Password Field */}
                        <Field
                            label="Current Password"
                            required
                            errorText={errors.password}
                            invalid={touched.password && !!errors.password}
                        >
                            <FormikField
                                name="password"
                                as={PasswordInput}
                                placeholder="Enter current password"
                                variant="outline"
                                onChange={handleChange}
                                value={values.password}
                                data-testid="current-password-input"
                            />
                        </Field>

                        {/* New Password Field */}
                        <Field
                            label="New Password"
                            required
                            errorText={errors.newPassword}
                            invalid={touched.newPassword && !!errors.newPassword}
                        >
                            <FormikField
                                name="newPassword"
                                as={PasswordInput}
                                placeholder="Enter new password"
                                variant="outline"
                                onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                                    handleChange(e);
                                    handlePasswordChange(e.target.value);
                                }}
                                value={values.newPassword}
                                data-testid="new-password-input"
                            />
                            <PasswordStrengthMeter
                                marginTop="5px"
                                value={passwordStrength}
                                minWidth="40%"
                            />
                        </Field>

                        {/* Confirm New Password Field */}
                        <Field
                            label="Confirm New Password"
                            required
                            errorText={errors.confirmNewPassword}
                            invalid={
                                touched.confirmNewPassword && !!errors.confirmNewPassword
                            }
                        >
                            <FormikField
                                name="confirmNewPassword"
                                as={PasswordInput}
                                placeholder="Confirm new password"
                                variant="outline"
                                onChange={handleChange}
                                value={values.confirmNewPassword}
                                data-testid="confirm-new-password-input"
                            />
                        </Field>

                        <Button
                            colorScheme="blue"
                            type="submit"
                            width="100%"
                            loading={isSubmitting}
                            loadingText="Updating..."
                            disabled={passwordStrength < 5}
                            marginTop={4}
                            data-testid="update-password-submit"
                        >
                            Update Password
                        </Button>
                    </VStack>
                </form>
            )}
        </Formik>
    );
};

export default UpdatePasswordForm;
