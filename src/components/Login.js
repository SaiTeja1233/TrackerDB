// src/components/Login.js
import React, { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";

const Login = () => {
    const { login } = useAuth();
    const navigate = useNavigate();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
        setLoading(true);

        try {
            await login(email, password);
            navigate("/dashboard");
        } catch (err) {
            setError("Failed to login: " + err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div
            style={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                minHeight: "100vh",
                backgroundColor: "#f5f5f5",
            }}
        >
            <div
                style={{
                    backgroundColor: "white",
                    padding: "40px",
                    borderRadius: "8px",
                    boxShadow: "0 2px 10px rgba(0,0,0,0.1)",
                    width: "100%",
                    maxWidth: "400px",
                }}
            >
                <h2
                    style={{
                        textAlign: "center",
                        marginBottom: "30px",
                        color: "#333",
                    }}
                >
                    Login
                </h2>

                {error && (
                    <div
                        style={{
                            backgroundColor: "#fee",
                            color: "#c33",
                            padding: "10px",
                            borderRadius: "4px",
                            marginBottom: "20px",
                            textAlign: "center",
                        }}
                    >
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit}>
                    <div style={{ marginBottom: "20px" }}>
                        <label
                            style={{
                                display: "block",
                                marginBottom: "5px",
                                color: "#555",
                                fontWeight: "500",
                            }}
                        >
                            Email
                        </label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            style={{
                                width: "100%",
                                padding: "10px",
                                border: "1px solid #ddd",
                                borderRadius: "4px",
                                fontSize: "16px",
                            }}
                        />
                    </div>

                    <div style={{ marginBottom: "20px" }}>
                        <label
                            style={{
                                display: "block",
                                marginBottom: "5px",
                                color: "#555",
                                fontWeight: "500",
                            }}
                        >
                            Password
                        </label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            style={{
                                width: "100%",
                                padding: "10px",
                                border: "1px solid #ddd",
                                borderRadius: "4px",
                                fontSize: "16px",
                            }}
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        style={{
                            width: "100%",
                            padding: "12px",
                            backgroundColor: "#4CAF50",
                            color: "white",
                            border: "none",
                            borderRadius: "4px",
                            fontSize: "16px",
                            cursor: loading ? "not-allowed" : "pointer",
                            opacity: loading ? 0.7 : 1,
                        }}
                    >
                        {loading ? "Logging in..." : "Login"}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default Login;
