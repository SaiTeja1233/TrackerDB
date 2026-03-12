import React, { useState, useEffect, useRef, useCallback } from "react";
import { useFormik } from "formik";
import * as Yup from "yup";
import {
    Eye,
    EyeOff,
    Mail,
    Lock,
    User as UserIcon,
    AlertCircle,
    CheckCircle,
    XCircle,
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import "./Auth.css";

const Auth = () => {
    const [isLogin, setIsLogin] = useState(true);
    const [showPassword, setShowPassword] = useState(false);
    const [registrationError, setRegistrationError] = useState("");
    const [usernameStatus, setUsernameStatus] = useState({
        checking: false,
        available: null,
        message: "",
    });
    const [emailStatus, setEmailStatus] = useState({
        checking: false,
        available: null,
        message: "",
    });
    
    // Refs to manipulate DOM directly
    const emailInputRef = useRef(null);
    const passwordInputRef = useRef(null);
    const nameInputRef = useRef(null);
    const formRef = useRef(null);
    
    // Track if initial clear has been done
    const initialClearDone = useRef(false);

    const { login, register, checkUsernameExists, checkEmailExists } =
        useAuth();

    const debounce = (func, wait) => {
        let timeout;
        return (...args) => {
            clearTimeout(timeout);
            timeout = setTimeout(() => func(...args), wait);
        };
    };

    const checkUsernameAvailability = async (username) => {
        if (!username || username.length < 3) {
            setUsernameStatus({
                checking: false,
                available: null,
                message: "Username must be at least 3 characters",
            });
            return;
        }

        if (!/^[a-zA-Z0-9_]+$/.test(username)) {
            setUsernameStatus({
                checking: false,
                available: null,
                message:
                    "Username can only contain letters, numbers, and underscores",
            });
            return;
        }

        setUsernameStatus({
            checking: true,
            available: null,
            message: "Checking availability...",
        });

        try {
            const exists = await checkUsernameExists(username);

            if (exists) {
                setUsernameStatus({
                    checking: false,
                    available: false,
                    message: "❌ Username is already taken",
                });
                formik.setFieldError("name", "Username already taken");
            } else {
                setUsernameStatus({
                    checking: false,
                    available: true,
                    message: "✓ Username is available",
                });
                if (
                    formik.errors.name &&
                    formik.errors.name.includes("taken")
                ) {
                    formik.setFieldError("name", undefined);
                }
            }
        } catch (error) {
            console.error("Error checking username:", error);
            setUsernameStatus({
                checking: false,
                available: null,
                message: "Error checking username",
            });
        }
    };

    const checkEmailAvailability = async (email) => {
        if (!email || !email.includes("@")) {
            setEmailStatus({
                checking: false,
                available: null,
                message: "",
            });
            return;
        }

        setEmailStatus({
            checking: true,
            available: null,
            message: "Checking email...",
        });

        try {
            const exists = await checkEmailExists(email);

            if (exists) {
                setEmailStatus({
                    checking: false,
                    available: false,
                    message: "❌ Email is already registered",
                });
                formik.setFieldError("email", "Email already registered");
            } else {
                setEmailStatus({
                    checking: false,
                    available: true,
                    message: "✓ Email is available",
                });
                if (
                    formik.errors.email &&
                    formik.errors.email.includes("registered")
                ) {
                    formik.setFieldError("email", undefined);
                }
            }
        } catch (error) {
            console.error("Error checking email:", error);
            setEmailStatus({
                checking: false,
                available: null,
                message: "Error checking email",
            });
        }
    };

    const debouncedUsernameCheck = debounce(checkUsernameAvailability, 500);
    const debouncedEmailCheck = debounce(checkEmailAvailability, 500);

    const formik = useFormik({
        initialValues: { email: "", password: "", name: "" },
        validationSchema: Yup.object({
            email: Yup.string()
                .email("Invalid email format")
                .required("Email is required"),
            password: Yup.string()
                .min(8, "Password must be at least 8 characters")
                .matches(
                    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
                    "Password must contain at least one uppercase letter, one lowercase letter, and one number",
                )
                .required("Password is required"),
            name: !isLogin
                ? Yup.string()
                      .min(3, "Username must be at least 3 characters")
                      .max(30, "Username is too long")
                      .matches(
                          /^[a-zA-Z0-9_]+$/,
                          "Username can only contain letters, numbers, and underscores",
                      )
                      .required("Username is required")
                : Yup.string(),
        }),
        onSubmit: async (
            values,
            { setSubmitting, setFieldError, resetForm },
        ) => {
            try {
                setRegistrationError("");

                const cleanEmail = values.email.trim().toLowerCase();
                const cleanPassword = values.password;

                if (isLogin) {
                    await login(cleanEmail, cleanPassword);
                } else {
                    const usernameExists = await checkUsernameExists(
                        values.name,
                    );
                    if (usernameExists) {
                        setFieldError("name", "This username is already taken");
                        setUsernameStatus({
                            checking: false,
                            available: false,
                            message: "❌ Username is already taken",
                        });
                        setSubmitting(false);
                        return;
                    }

                    const emailExists = await checkEmailExists(cleanEmail);
                    if (emailExists) {
                        setFieldError(
                            "email",
                            "This email is already registered",
                        );
                        setEmailStatus({
                            checking: false,
                            available: false,
                            message: "❌ Email is already registered",
                        });
                        setSubmitting(false);
                        return;
                    }

                    await register(
                        cleanEmail,
                        cleanPassword,
                        values.name.trim(),
                    );
                }
            } catch (err) {
                console.error("Authentication error:", err);

                if (err.message?.includes("Username already taken")) {
                    setFieldError("name", "This username is already taken");
                    setUsernameStatus({
                        checking: false,
                        available: false,
                        message: "❌ Username is already taken",
                    });
                    setRegistrationError(
                        "Username is already taken. Please try another one.",
                    );
                } else if (err.message?.includes("Email already registered")) {
                    setFieldError("email", "This email is already registered");
                    setEmailStatus({
                        checking: false,
                        available: false,
                        message: "❌ Email is already registered",
                    });
                    setRegistrationError(
                        "An account with this email already exists. Please sign in instead.",
                    );
                } else if (err.message?.includes("Invalid credentials")) {
                    setFieldError("password", "Invalid email or password");
                } else {
                    setRegistrationError(
                        err.message || "An error occurred. Please try again.",
                    );
                }
            } finally {
                setSubmitting(false);
            }
        },
    });

    // Function to clear only autofilled values (not user input)
    const clearAutofilledInputs = useCallback(() => {
        // Only clear if fields haven't been touched by user
        if (!formik.touched.email && emailInputRef.current && emailInputRef.current.value) {
            emailInputRef.current.value = '';
            formik.setFieldValue('email', '');
        }
        if (!formik.touched.password && passwordInputRef.current && passwordInputRef.current.value) {
            passwordInputRef.current.value = '';
            formik.setFieldValue('password', '');
        }
        if (!formik.touched.name && nameInputRef.current && nameInputRef.current.value) {
            nameInputRef.current.value = '';
            formik.setFieldValue('name', '');
        }
    }, [formik]);

    // Clear autofill on mount and when toggling modes - but only once
    useEffect(() => {
        // Only run initial clear if not done yet
        if (!initialClearDone.current) {
            clearAutofilledInputs();
            
            // Multiple timers to catch autofill at different times
            const timers = [
                setTimeout(() => {
                    clearAutofilledInputs();
                    initialClearDone.current = true;
                }, 100),
                setTimeout(clearAutofilledInputs, 300),
                setTimeout(clearAutofilledInputs, 500)
            ];
            
            return () => timers.forEach(clearTimeout);
        }
    }, [isLogin, clearAutofilledInputs]);

    // Reset initial clear flag when toggling modes
    useEffect(() => {
        initialClearDone.current = false;
    }, [isLogin]);

    // Handle input changes
    const handleNameChange = (e) => {
        const value = e.target.value;
        formik.setFieldValue('name', value);
        formik.setFieldTouched('name', true, false);

        if (!value) {
            setUsernameStatus({
                checking: false,
                available: null,
                message: "",
            });
            return;
        }

        if (value.length < 3) {
            setUsernameStatus({
                checking: false,
                available: null,
                message: "Username must be at least 3 characters",
            });
        } else if (!/^[a-zA-Z0-9_]*$/.test(value)) {
            setUsernameStatus({
                checking: false,
                available: null,
                message:
                    "Username can only contain letters, numbers, and underscores",
            });
        } else {
            debouncedUsernameCheck(value);
        }
    };

    const handleEmailChange = (e) => {
        const value = e.target.value;
        formik.setFieldValue('email', value);
        formik.setFieldTouched('email', true, false);

        if (!value || !value.includes("@")) {
            setEmailStatus({
                checking: false,
                available: null,
                message: "",
            });
            return;
        }

        debouncedEmailCheck(value);
    };

    const handlePasswordChange = (e) => {
        const value = e.target.value;
        formik.setFieldValue('password', value);
        formik.setFieldTouched('password', true, false);
    };

    const getUsernameIcon = () => {
        if (usernameStatus.checking) {
            return <div className="spinner-small"></div>;
        } else if (usernameStatus.available === true) {
            return <CheckCircle size={18} className="success-icon" />;
        } else if (usernameStatus.available === false) {
            return <XCircle size={18} className="error-icon" />;
        }
        return <UserIcon className="field-icon" size={18} />;
    };

    const getEmailIcon = () => {
        if (emailStatus.checking) {
            return <div className="spinner-small"></div>;
        } else if (emailStatus.available === true) {
            return <CheckCircle size={18} className="success-icon" />;
        } else if (emailStatus.available === false) {
            return <XCircle size={18} className="error-icon" />;
        }
        return <Mail className="field-icon" size={18} />;
    };

    const isEmailDisabled = () => {
        if (isLogin) return false;
        
        return (
            usernameStatus.checking || 
            usernameStatus.available === false || 
            !formik.values.name ||
            formik.values.name.length < 3 ||
            !/^[a-zA-Z0-9_]*$/.test(formik.values.name)
        );
    };

    const isSubmitDisabled = () => {
        if (formik.isSubmitting) return true;
        if (isLogin) {
            return !formik.values.email || !formik.values.password;
        }

        if (
            !formik.values.email ||
            !formik.values.password ||
            !formik.values.name
        ) {
            return true;
        }

        if (Object.keys(formik.errors).length > 0) {
            return true;
        }

        if (usernameStatus.checking) return true;
        if (usernameStatus.available !== true) return true;

        if (emailStatus.checking) return true;
        if (emailStatus.available !== true) return true;

        return false;
    };

    return (
        <div className="auth-wrapper">
            <div className="logo-section">
                <h1>TrackerDB</h1>
            </div>
            <div className="auth-card">
                <div className="auth-header">
                    <h2>{isLogin ? "Welcome Back" : "Create Account"}</h2>
                    <p>
                        {isLogin
                            ? "Enter your credentials to access your dashboard"
                            : "Join our community of trackers today"}
                    </p>
                </div>

                {registrationError && (
                    <div className="error-banner">
                        <AlertCircle size={18} />
                        <span>{registrationError}</span>
                        {!isLogin &&
                            registrationError.includes(
                                "email already exists",
                            ) && (
                                <div className="error-actions">
                                    <button
                                        type="button"
                                        className="switch-to-login"
                                        onClick={() => {
                                            setIsLogin(true);
                                            setRegistrationError("");
                                            clearAutofilledInputs();
                                            initialClearDone.current = false;
                                        }}
                                    >
                                        Sign In Now
                                    </button>
                                </div>
                            )}
                    </div>
                )}

                <form
                    ref={formRef}
                    onSubmit={formik.handleSubmit}
                    className="auth-form"
                    noValidate
                    autoComplete="new-password"
                >
                    {!isLogin && (
                        <div className="input-group">
                            <label>Username</label>
                            <div
                                className={`input-field ${
                                    usernameStatus.available === true
                                        ? "success"
                                        : usernameStatus.available === false
                                          ? "error"
                                          : ""
                                }`}
                            >
                                {getUsernameIcon()}
                                <input
                                    ref={nameInputRef}
                                    name="name"
                                    type="text"
                                    placeholder="johndoe_123"
                                    autoComplete="new-password"
                                    autoCapitalize="none"
                                    autoCorrect="off"
                                    spellCheck="false"
                                    value={formik.values.name}
                                    onChange={handleNameChange}
                                    onBlur={formik.handleBlur}
                                />
                            </div>
                            {formik.values.name && (
                                <div
                                    className={`username-status ${
                                        usernameStatus.available === true
                                            ? "success"
                                            : usernameStatus.available === false
                                              ? "error"
                                              : ""
                                    }`}
                                >
                                    {usernameStatus.message}
                                </div>
                            )}
                        </div>
                    )}

                    <div className="input-group">
                        <label>Email Address</label>
                        <div
                            className={`input-field ${
                                !isLogin && emailStatus.available === true
                                    ? "success"
                                    : !isLogin &&
                                        emailStatus.available === false
                                      ? "error"
                                      : ""
                            }`}
                        >
                            {!isLogin ? (
                                getEmailIcon()
                            ) : (
                                <Mail className="field-icon" size={18} />
                            )}
                            <input
                                ref={emailInputRef}
                                name="email"
                                type="email"
                                placeholder="name@company.com"
                                autoComplete="new-password"
                                autoCapitalize="none"
                                autoCorrect="off"
                                spellCheck="false"
                                className={
                                    formik.touched.email && formik.errors.email
                                        ? "error"
                                        : ""
                                }
                                value={formik.values.email}
                                onChange={handleEmailChange}
                                onBlur={formik.handleBlur}
                                disabled={!isLogin && isEmailDisabled()}
                                style={
                                    !isLogin && isEmailDisabled()
                                        ? { 
                                            backgroundColor: '#f3f4f6', 
                                            cursor: 'not-allowed',
                                            opacity: 0.7
                                          }
                                        : {}
                                }
                            />
                        </div>
                        {!isLogin &&
                            formik.values.email &&
                            emailStatus.message && (
                                <div
                                    className={`username-status ${
                                        emailStatus.available === true
                                            ? "success"
                                            : emailStatus.available === false
                                              ? "error"
                                              : ""
                                    }`}
                                >
                                    {emailStatus.message}
                                </div>
                            )}
                        {formik.touched.email &&
                            formik.errors.email &&
                            !emailStatus.checking && (
                                <span className="error-text">
                                    {formik.errors.email}
                                </span>
                            )}
                    </div>

                    <div className="input-group">
                        <label>Password</label>
                        <div className="input-field">
                            <Lock className="field-icon" size={18} />
                            <input
                                ref={passwordInputRef}
                                name="password"
                                type={showPassword ? "text" : "password"}
                                placeholder="••••••••"
                                autoComplete="new-password"
                                autoCapitalize="none"
                                autoCorrect="off"
                                className={
                                    formik.touched.password &&
                                    formik.errors.password
                                        ? "error"
                                        : ""
                                }
                                disabled={!isLogin && isEmailDisabled()}
                                style={
                                    !isLogin && isEmailDisabled()
                                        ? { 
                                            backgroundColor: '#f3f4f6', 
                                            cursor: 'not-allowed',
                                            opacity: 0.7
                                          }
                                        : {}
                                }
                                value={formik.values.password}
                                onChange={handlePasswordChange}
                                onBlur={formik.handleBlur}
                            />
                            <button
                                type="button"
                                className="password-toggle"
                                onClick={() => setShowPassword(!showPassword)}
                                disabled={!isLogin && isEmailDisabled()}
                            >
                                {showPassword ? (
                                    <EyeOff size={18} />
                                ) : (
                                    <Eye size={18} />
                                )}
                            </button>
                        </div>
                        {formik.touched.password && formik.errors.password && (
                            <span className="error-text">
                                {formik.errors.password}
                            </span>
                        )}
                    </div>

                    <button
                        type="submit"
                        className="auth-submit-btn"
                        disabled={isSubmitDisabled()}
                    >
                        {formik.isSubmitting ? (
                            <span className="loading-spinner-small"></span>
                        ) : isLogin ? (
                            "Sign In"
                        ) : (
                            "Create Account"
                        )}
                    </button>
                </form>

                <div className="auth-footer">
                    <p>
                        {isLogin
                            ? "Don't have an account?"
                            : "Already have an account?"}
                        <button
                            type="button"
                            className="toggle-auth-btn"
                            onClick={() => {
                                setIsLogin(!isLogin);
                                setRegistrationError("");
                                setUsernameStatus({
                                    checking: false,
                                    available: null,
                                    message: "",
                                });
                                setEmailStatus({
                                    checking: false,
                                    available: null,
                                    message: "",
                                });
                                clearAutofilledInputs();
                                initialClearDone.current = false;
                            }}
                        >
                            {isLogin ? "Create one" : "Sign in"}
                        </button>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default Auth;