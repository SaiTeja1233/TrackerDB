// context/DataContext.js
import React, { createContext, useContext, useState, useEffect } from "react";
import { databases, Query } from "../appwrite";
import { useExportData } from "../hooks/useExportData";

const DataContext = createContext();

export const useData = () => {
    const context = useContext(DataContext);
    if (!context) {
        throw new Error("useData must be used within a DataProvider");
    }
    return context;
};

export const DataProvider = ({ children }) => {
    const [posts, setPosts] = useState([]);
    const [comments, setComments] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [lastUpdated, setLastUpdated] = useState(null);
    const { exportToExcel } = useExportData();

    const DB_ID = "699d8e26001498ef3487";
    const POST_COLLECTION = "posts";
    const COMMENT_COLLECTION = "comments";

    const fetchData = async () => {
        setIsLoading(true);
        try {
            const [p, c] = await Promise.all([
                databases.listDocuments(DB_ID, POST_COLLECTION, [
                    Query.limit(5000),
                ]),
                databases.listDocuments(DB_ID, COMMENT_COLLECTION, [
                    Query.limit(5000),
                ]),
            ]);
            setPosts(p.documents);
            setComments(c.documents);
            setLastUpdated(new Date());
            return { posts: p.documents, comments: c.documents };
        } catch (err) {
            console.error("Fetch Error:", err);
            throw err;
        } finally {
            setIsLoading(false);
        }
    };

    const handleExport = async (showAlert = true) => {
        try {
            // Use current data or fetch fresh data if empty
            let currentPosts = posts;
            let currentComments = comments;

            if (currentPosts.length === 0 && currentComments.length === 0) {
                const freshData = await fetchData();
                currentPosts = freshData.posts;
                currentComments = freshData.comments;
            }

            const result = exportToExcel(currentPosts, currentComments);

            if (showAlert && result.success) {
                alert(result.message);
            } else if (showAlert && !result.success) {
                alert("Failed to export data: " + result.message);
            }

            return result;
        } catch (err) {
            console.error("Error in handleExport:", err);
            if (showAlert) {
                alert("Failed to export data: " + err.message);
            }
            return { success: false, message: err.message };
        }
    };

    // Initial data fetch
    useEffect(() => {
        fetchData();
    }, []);

    const value = {
        posts,
        comments,
        isLoading,
        lastUpdated,
        fetchData,
        handleExport,
        setPosts,
        setComments,
        setLastUpdated,
    };

    return (
        <DataContext.Provider value={value}>{children}</DataContext.Provider>
    );
};
