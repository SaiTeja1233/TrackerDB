import { createContext, useContext, useEffect, useState } from "react";
import { account, databases, ID, Query } from "../appwrite";

const AuthContext = createContext();

const DB_ID = "699d8e26001498ef3487";
const USERS_COLLECTION = "users";

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [userProfile, setUserProfile] = useState(null);

    useEffect(() => {
        checkUserStatus();
    }, []);

    const checkUserStatus = async () => {
        try {
            const session = await account.get();
            setUser(session);

            try {
                const profiles = await databases.listDocuments(
                    DB_ID,
                    USERS_COLLECTION,
                    [Query.equal("userId", session.$id)],
                );

                if (profiles.documents.length > 0) {
                    setUserProfile(profiles.documents[0]);
                }
            } catch (profileError) {
                console.error("Error fetching user profile:", profileError);
            }
        } catch (error) {
            setUser(null);
            setUserProfile(null);
        } finally {
            setLoading(false);
        }
    };

    const checkUsernameExists = async (username) => {
        try {
            const lowercaseUsername = username.toLowerCase().trim();

            const users = await databases.listDocuments(
                DB_ID,
                USERS_COLLECTION,
                [Query.equal("username", lowercaseUsername)],
            );

            return users.documents.length > 0;
        } catch (error) {
            console.error("Error checking username:", error);
            return false;
        }
    };

    const checkEmailExists = async (email) => {
        try {
            const lowercaseEmail = email.toLowerCase().trim();

            const users = await databases.listDocuments(
                DB_ID,
                USERS_COLLECTION,
                [Query.equal("email", lowercaseEmail)],
            );

            return users.documents.length > 0;
        } catch (error) {
            console.error("Error checking email:", error);
            return false;
        }
    };

    const login = async (email, password) => {
        try {
            await account.createEmailPasswordSession(email, password);
            const userData = await account.get();
            setUser(userData);

            try {
                const profiles = await databases.listDocuments(
                    DB_ID,
                    USERS_COLLECTION,
                    [Query.equal("userId", userData.$id)],
                );

                if (profiles.documents.length > 0) {
                    setUserProfile(profiles.documents[0]);
                }
            } catch (profileError) {
                console.error("Error fetching user profile:", profileError);
            }
        } catch (error) {
            console.error("Login error:", error);
            throw error;
        }
    };

    const register = async (email, password, name) => {
        try {
            const usernameExists = await checkUsernameExists(name);
            if (usernameExists) {
                throw new Error("Username already taken");
            }

            const emailExists = await checkEmailExists(email);
            if (emailExists) {
                throw new Error("Email already registered");
            }

            const newUser = await account.create(
                ID.unique(),
                email,
                password,
                name,
            );

            try {
                await databases.createDocument(
                    DB_ID,
                    USERS_COLLECTION,
                    ID.unique(),
                    {
                        userId: newUser.$id,
                        username: name.toLowerCase().trim(),
                        displayName: name.trim(),
                        email: email.toLowerCase().trim(),
                        createdAt: new Date().toISOString(),
                    },
                );
            } catch (profileError) {
                console.error("Error creating user profile:", profileError);
                try {
                    await account.deleteSession("current");
                } catch (cleanupError) {
                    console.error("Cleanup error:", cleanupError);
                }
                throw new Error(
                    "Failed to create user profile. Please try again.",
                );
            }

            await login(email, password);
        } catch (error) {
            console.error("Registration error:", error);
            throw error;
        }
    };

    const logout = async () => {
        try {
            await account.deleteSession("current");
        } catch (error) {
            console.error("Logout error:", error);
        } finally {
            setUser(null);
            setUserProfile(null);
        }
    };

    return (
        <AuthContext.Provider
            value={{
                user,
                userProfile,
                login,
                register,
                logout,
                loading,
                checkUsernameExists,
                checkEmailExists,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
