import React, { useState } from "react";
import { useFormik } from "formik";
import * as Yup from "yup";
import { Eye, EyeOff, Mail, Lock, User as UserIcon } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import "./Auth.css";

const Auth = () => {
    const [isLogin, setIsLogin] = useState(true);
    const [showPassword, setShowPassword] = useState(false);
    const { login, register } = useAuth();

    const formik = useFormik({
        initialValues: { email: "", password: "", name: "" },
        validationSchema: Yup.object({
            email: Yup.string().email("Invalid email").required("Required"),
            password: Yup.string()
                .min(8, "Must be at least 8 characters")
                .required("Required"),
            name: !isLogin
                ? Yup.string().required("Name is required")
                : Yup.string(),
        }),
        onSubmit: async (values) => {
            try {
                if (isLogin) await login(values.email, values.password);
                else await register(values.email, values.password, values.name);
            } catch (err) {
                alert(err.message);
            }
        },
    });

    return (
        <div className="auth-wrapper">
            <div className="auth-card">
                <div className="auth-header">
                    <h2>{isLogin ? "Welcome Back" : "Create Account"}</h2>
                    <p>
                        {isLogin
                            ? "Enter your credentials to access your dashboard"
                            : "Join our community of trackers today"}
                    </p>
                </div>

                <form onSubmit={formik.handleSubmit} className="auth-form">
                    {!isLogin && (
                        <div className="input-group">
                            <label>Full Name</label>
                            <div className="input-field">
                                <UserIcon className="field-icon" size={18} />
                                <input
                                    name="name"
                                    type="text"
                                    placeholder="John Doe"
                                    {...formik.getFieldProps("name")}
                                />
                            </div>
                            {formik.touched.name && formik.errors.name && (
                                <span className="error-text">
                                    {formik.errors.name}
                                </span>
                            )}
                        </div>
                    )}

                    <div className="input-group">
                        <label>Email Address</label>
                        <div className="input-field">
                            <Mail className="field-icon" size={18} />
                            <input
                                name="email"
                                type="email"
                                placeholder="name@company.com"
                                {...formik.getFieldProps("email")}
                            />
                        </div>
                        {formik.touched.email && formik.errors.email && (
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
                                name="password"
                                type={showPassword ? "text" : "password"}
                                placeholder="••••••••"
                                {...formik.getFieldProps("password")}
                            />
                            <button
                                type="button"
                                className="password-toggle"
                                onClick={() => setShowPassword(!showPassword)}
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

                    <button type="submit" className="auth-submit-btn">
                        {isLogin ? "Sign In" : "Register"}
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
                            onClick={() => setIsLogin(!isLogin)}
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
