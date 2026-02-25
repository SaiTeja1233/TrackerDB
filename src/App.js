import {
    BrowserRouter as Router,
    Routes,
    Route,
    Navigate,
} from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";
import Auth from "./components/Auth/Auth";
import Dashboard from "./components/Dashboard"; // Import the tracker logic

const Main = () => {
    const { user, loading } = useAuth();

    // Show a loading screen while Appwrite checks the session
    if (loading) return <div className="loader">Loading...</div>;

    return (
        <Routes>
            {/* If logged in, show Tracker Dashboard. Otherwise, show Auth (Login/Register) */}
            <Route path="/" element={user ? <Dashboard /> : <Auth />} />

            {/* Redirect any unknown paths back to home */}
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
