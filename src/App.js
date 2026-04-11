// src/App.js
import React from "react";
import {
    BrowserRouter as Router,
    Routes,
    Route,
    Navigate,
} from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import { DataProvider } from "./context/DataContext";
import Login from "./components/Login";
import Dashboard from "./components/Dashboard";
import Payments from "./components/Payments";
import PrivateRoute from "./components/PrivateRoute";

function App() {
    return (
        <Router>
            <AuthProvider>
                <DataProvider>
                    <Routes>
                        <Route path="/login" element={<Login />} />
                        <Route
                            path="/dashboard"
                            element={
                                <PrivateRoute>
                                    <Dashboard />
                                </PrivateRoute>
                            }
                        />
                        <Route
                            path="/payments"
                            element={
                                <PrivateRoute>
                                    <Payments />
                                </PrivateRoute>
                            }
                        />
                        <Route
                            path="/"
                            element={<Navigate to="/dashboard" />}
                        />
                    </Routes>
                </DataProvider>
            </AuthProvider>
        </Router>
    );
}

export default App;
