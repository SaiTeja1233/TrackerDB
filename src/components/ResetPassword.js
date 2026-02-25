import React, { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";

const ResetPassword = () => {
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const { resetPassword } = useAuth();
    const navigate = useNavigate();

    // Get parameters from the URL
    const urlParams = new URLSearchParams(window.location.search);
    const userId = urlParams.get("userId");
    const secret = urlParams.get("secret");

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (password !== confirmPassword)
            return alert("Passwords do not match");

        try {
            await resetPassword(userId, secret, password, confirmPassword);
            navigate("/"); // Redirect to login after success
        } catch (err) {
            console.error(err);
        }
    };

    return (
        <div className="auth-container">
            <div className="auth-card">
                <h2>Set New Password</h2>
                <form onSubmit={handleSubmit}>
                    <div className="input-group">
                        <input
                            type="password"
                            placeholder="New Password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                    </div>
                    <div className="input-group">
                        <input
                            type="password"
                            placeholder="Confirm New Password"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            required
                        />
                    </div>
                    <button type="submit" className="auth-btn">
                        Update Password
                    </button>
                </form>
            </div>
        </div>
    );
};

export default ResetPassword;
