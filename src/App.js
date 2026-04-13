import {
    BrowserRouter as Router,
    Routes,
    Route,
    Navigate,
} from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { DataProvider } from "./context/DataContext";
import Auth from "./components/Auth/Auth";
import Dashboard from "./components/Dashboard";
import Payments from "./components/Payments"; // Create this component
import Wozcode from "./components/Wozcode";

// Protected route wrapper that includes DataProvider
const ProtectedRoute = ({ children }) => {
    const { user, loading } = useAuth();

    if (loading) return <div className="loader">Loading...</div>;

    if (!user) {
        return <Navigate to="/" replace />;
    }

    return <DataProvider>{children}</DataProvider>;
};

const Main = () => {
    const { user, loading } = useAuth();

    if (loading) return <div className="loader">Loading...</div>;

    return (
        <Routes>
            {/* Public route */}
            <Route
                path="/"
                element={user ? <Navigate to="/dashboard" /> : <Auth />}
            />
            <Route path="wozcode" element={<Wozcode />} />

            {/* Protected routes with DataProvider */}
            <Route
                path="/dashboard"
                element={
                    <ProtectedRoute>
                        <Dashboard />
                    </ProtectedRoute>
                }
            />

            <Route
                path="/payments"
                element={
                    <ProtectedRoute>
                        <Payments />
                    </ProtectedRoute>
                }
            />

            {/* Redirect any unknown paths */}
            <Route path="*" element={<Navigate to="/" />} />
        </Routes>
    );
};

function App() {
    return (
        <Router>
            <AuthProvider>
                <Main />
            </AuthProvider>
        </Router>
    );
}

export default App;
