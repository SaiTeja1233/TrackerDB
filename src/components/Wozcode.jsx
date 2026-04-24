// Wozcode.jsx
import React, { useState, useEffect, useMemo, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { databases, ID, Query } from "../appwrite";
import { useAuth } from "../context/AuthContext";
import * as XLSX from "xlsx";
import {
    User,
    Link as LinkIcon,
    Trash2,
    Plus,
    Clock,
    Calendar,
    X,
    MessageCircle,
    Activity,
    ChevronUp,
    Code,
    Zap,
    ArrowLeft,
    AlertCircle,
} from "lucide-react";
import "./Wozcode.css";

const Wozcode = () => {
    const { user } = useAuth();
    const navigate = useNavigate();

    const [postUrl, setPostUrl] = useState("");
    const [commentUrl, setCommentUrl] = useState("");
    const [wozcodePosts, setWozcodePosts] = useState([]);
    const [wozcodeComments, setWozcodeComments] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [activeView, setActiveView] = useState("posts");
    const [showPostInput, setShowPostInput] = useState(false);
    const [showCommentInput, setShowCommentInput] = useState(false);
    const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);
    const [showBackToTop, setShowBackToTop] = useState(false);
    const [currentTime, setCurrentTime] = useState(new Date());
    const [visitedLinks, setVisitedLinks] = useState([]);
    const [error, setError] = useState(null);

    // Filter States
    const [tempUser, setTempUser] = useState("All Users");
    const [tempDate, setTempDate] = useState("");
    const [appliedUser, setAppliedUser] = useState("All Users");
    const [appliedDate, setAppliedDate] = useState("");

    // Database configuration
    const DB_ID = "699d8e26001498ef3487";
    const WOZCODE_POST_COLLECTION = "wozcode_posts";
    const WOZCODE_COMMENT_COLLECTION = "wozcode_comments";

    // Fetch Wozcode data
    const fetchWozcodeData = useCallback(async () => {
        setIsLoading(true);
        setError(null);

        try {
            console.log("Starting to fetch Wozcode data...");
            console.log("Database ID:", DB_ID);
            console.log("Posts Collection:", WOZCODE_POST_COLLECTION);
            console.log("Comments Collection:", WOZCODE_COMMENT_COLLECTION);

            // Fetch posts
            const postsResponse = await databases.listDocuments(
                DB_ID,
                WOZCODE_POST_COLLECTION,
                [Query.limit(1000), Query.orderDesc("$createdAt")],
            );

            // Fetch comments
            const commentsResponse = await databases.listDocuments(
                DB_ID,
                WOZCODE_COMMENT_COLLECTION,
                [Query.limit(1000), Query.orderDesc("$createdAt")],
            );

            setWozcodePosts(postsResponse.documents);
            setWozcodeComments(commentsResponse.documents);

            console.log(
                `Fetched ${postsResponse.documents.length} posts and ${commentsResponse.documents.length} comments`,
            );

            if (
                postsResponse.documents.length === 0 &&
                commentsResponse.documents.length === 0
            ) {
                setError(
                    "No data found. Please add your first post or comment.",
                );
            }
        } catch (err) {
            console.error("Error fetching Wozcode data:", err);
            setError(
                `Error fetching data: ${err.message}. Please check your database configuration and permissions.`,
            );

            // Fallback: fetch without any queries
            try {
                console.log("Trying fallback fetch without queries...");
                const postsResponse = await databases.listDocuments(
                    DB_ID,
                    WOZCODE_POST_COLLECTION,
                );

                const commentsResponse = await databases.listDocuments(
                    DB_ID,
                    WOZCODE_COMMENT_COLLECTION,
                );

                setWozcodePosts(postsResponse.documents);
                setWozcodeComments(commentsResponse.documents);
                console.log(
                    `Fallback fetch: ${postsResponse.documents.length} posts, ${commentsResponse.documents.length} comments`,
                );
                setError(null);
            } catch (fallbackErr) {
                console.error("Fallback fetch also failed:", fallbackErr);
                setError(`Cannot connect to database. Please verify: 
1. Database ID "${DB_ID}" exists
2. Collections "${WOZCODE_POST_COLLECTION}" and "${WOZCODE_COMMENT_COLLECTION}" exist
3. You have proper read permissions`);
            }
        } finally {
            setIsLoading(false);
        }
    }, []);

    // Update current time every second
    useEffect(() => {
        const timer = setInterval(() => {
            setCurrentTime(new Date());
        }, 1000);
        return () => clearInterval(timer);
    }, []);

    // Scroll listener for back to top button
    useEffect(() => {
        const handleScroll = () => {
            setShowBackToTop(window.scrollY > 400);
        };
        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    // Load visited links from localStorage
    useEffect(() => {
        const saved = localStorage.getItem("wozcodeVisitedLinks");
        if (saved) setVisitedLinks(JSON.parse(saved));
    }, []);

    // Refresh data when component becomes visible
    useEffect(() => {
        const handleVisibilityChange = () => {
            if (document.visibilityState === "visible") {
                fetchWozcodeData();
            }
        };

        document.addEventListener("visibilitychange", handleVisibilityChange);

        return () => {
            document.removeEventListener(
                "visibilitychange",
                handleVisibilityChange,
            );
        };
    }, [fetchWozcodeData]);

    // Initial data fetch
    useEffect(() => {
        fetchWozcodeData();
    }, [fetchWozcodeData]);

    const parseDate = (dateString) => {
        if (!dateString) return new Date(0);
        let date = new Date(dateString);
        if (isNaN(date.getTime())) {
            const match = dateString.match(
                /(\d{4})-(\d{2})-(\d{2}),?\s*(\d{1,2}):(\d{2}):(\d{2})\s*(AM|PM)?/i,
            );
            if (match) {
                const year = parseInt(match[1]);
                const month = parseInt(match[2]);
                const day = parseInt(match[3]);
                let hours = parseInt(match[4]);
                const minutes = parseInt(match[5]);
                const seconds = parseInt(match[6]);
                const ampm = match[7];

                if (ampm) {
                    if (ampm.toUpperCase() === "PM" && hours < 12) hours += 12;
                    if (ampm.toUpperCase() === "AM" && hours === 12) hours = 0;
                }
                return new Date(year, month - 1, day, hours, minutes, seconds);
            }
        }
        return date;
    };

    const formatDateTime = (date) => {
        if (!date) return "N/A";
        return new Date(date).toLocaleString("en-US", {
            year: "numeric",
            month: "short",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit",
            hour12: true,
        });
    };

    const uniqueUsernames = useMemo(() => {
        const allItems = [...wozcodePosts, ...wozcodeComments];
        const names = allItems.map((item) => item.username).filter(Boolean);
        return ["All Users", ...new Set(names)];
    }, [wozcodePosts, wozcodeComments]);

    const filteredPosts = useMemo(() => {
        return wozcodePosts
            .filter((item) => {
                const matchesUser =
                    appliedUser === "All Users" ||
                    item.username === appliedUser;
                let matchesDate = true;
                if (appliedDate) {
                    const itemDate = parseDate(
                        item.createdAt || item.$createdAt,
                    );
                    const filterDate = new Date(appliedDate);
                    matchesDate =
                        itemDate.toDateString() === filterDate.toDateString();
                }
                return matchesUser && matchesDate;
            })
            .sort((a, b) => {
                const dateA = parseDate(a.createdAt || a.$createdAt);
                const dateB = parseDate(b.createdAt || b.$createdAt);
                return dateB - dateA;
            });
    }, [wozcodePosts, appliedUser, appliedDate]);

    const filteredComments = useMemo(() => {
        return wozcodeComments
            .filter((item) => {
                const matchesUser =
                    appliedUser === "All Users" ||
                    item.username === appliedUser;
                let matchesDate = true;
                if (appliedDate) {
                    const itemDate = parseDate(
                        item.createdAt || item.$createdAt,
                    );
                    const filterDate = new Date(appliedDate);
                    matchesDate =
                        itemDate.toDateString() === filterDate.toDateString();
                }
                return matchesUser && matchesDate;
            })
            .sort((a, b) => {
                const dateA = parseDate(a.createdAt || a.$createdAt);
                const dateB = parseDate(b.createdAt || b.$createdAt);
                return dateB - dateA;
            });
    }, [wozcodeComments, appliedUser, appliedDate]);

    const today = new Date();
    const todaysPosts = filteredPosts.filter((item) => {
        const itemDate = parseDate(item.createdAt || item.$createdAt);
        return itemDate.toDateString() === today.toDateString();
    });

    const todaysComments = filteredComments.filter((item) => {
        const itemDate = parseDate(item.createdAt || item.$createdAt);
        return itemDate.toDateString() === today.toDateString();
    });

    const stats = {
        totalPosts: wozcodePosts.length,
        totalComments: wozcodeComments.length,
        todaysPosts: todaysPosts.length,
        todaysComments: todaysComments.length,
        totalTodays: todaysPosts.length + todaysComments.length,
    };

    const handleApplyFilters = () => {
        setAppliedUser(tempUser);
        setAppliedDate(tempDate);
        setIsFilterModalOpen(false);
    };

    const handleResetFilters = () => {
        setAppliedUser("All Users");
        setAppliedDate("");
        setTempUser("All Users");
        setTempDate("");
        setIsFilterModalOpen(false);
    };

    const handleVisit = (id, url) => {
        if (!visitedLinks.includes(id)) {
            const updated = [...visitedLinks, id];
            setVisitedLinks(updated);
            localStorage.setItem(
                "wozcodeVisitedLinks",
                JSON.stringify(updated),
            );
        }
        window.open(url, "_blank");
    };

    const handleAddTracker = async (e, type) => {
        e.preventDefault();
        const url = type === "post" ? postUrl : commentUrl;
        const collection =
            type === "post"
                ? WOZCODE_POST_COLLECTION
                : WOZCODE_COMMENT_COLLECTION;

        if (!url) {
            alert("Please enter a URL");
            return;
        }

        // Validate URL
        try {
            new URL(url);
        } catch {
            alert("Please enter a valid URL (include http:// or https://)");
            return;
        }

        try {
            const now = currentTime;
            const year = now.getFullYear();
            const month = String(now.getMonth() + 1).padStart(2, "0");
            const day = String(now.getDate()).padStart(2, "0");
            const dateString = `${year}-${month}-${day}`;

            let hours = now.getHours();
            const minutes = String(now.getMinutes()).padStart(2, "0");
            const seconds = String(now.getSeconds()).padStart(2, "0");
            const ampm = hours >= 12 ? "PM" : "AM";
            hours = hours % 12;
            hours = hours ? hours : 12;
            const timeString = `${hours}:${minutes}:${seconds} ${ampm}`;
            const fullDate = `${dateString}, ${timeString}`;

            const documentData = {
                url: url,
                username: user?.name,
                createdAt: fullDate,
                platform: "wozcode",
            };

            console.log("Adding document:", documentData);

            const newDocument = await databases.createDocument(
                DB_ID,
                collection,
                ID.unique(),
                documentData,
            );

            console.log("Document added successfully:", newDocument);

            // Update state immediately to reflect the new count
            if (type === "post") {
                setWozcodePosts((prevPosts) => [newDocument, ...prevPosts]);
                setPostUrl("");
                setShowPostInput(false);
            } else {
                setWozcodeComments((prevComments) => [
                    newDocument,
                    ...prevComments,
                ]);
                setCommentUrl("");
                setShowCommentInput(false);
            }

            alert(
                `${type === "post" ? "Post" : "Comment"} added successfully at ${fullDate}`,
            );

            // Switch to appropriate view
            if (type === "post") {
                setActiveView("posts");
            } else {
                setActiveView("comments");
            }
        } catch (err) {
            console.error("Error adding tracker:", err);
            alert("Failed to add: " + err.message);
        }
    };

    const handleDelete = async (docId, collection) => {
        if (!window.confirm("Delete this link?")) return;
        try {
            await databases.deleteDocument(DB_ID, collection, docId);
            // Update state immediately after deletion
            if (collection === WOZCODE_POST_COLLECTION) {
                setWozcodePosts((prevPosts) =>
                    prevPosts.filter((post) => post.$id !== docId),
                );
            } else {
                setWozcodeComments((prevComments) =>
                    prevComments.filter((comment) => comment.$id !== docId),
                );
            }
            alert("Deleted successfully!");
        } catch (err) {
            console.error("Delete failed:", err);
            alert("Delete failed: " + err.message);
        }
    };

    const scrollToTop = () => {
        window.scrollTo({ top: 0, behavior: "smooth" });
    };

    const handleExport = () => {
        // Prepare data based on current filters
        let postsToExport = [];
        let commentsToExport = [];

        // Check if filters are applied
        const isUserFiltered = appliedUser !== "All Users";
        const isDateFiltered = appliedDate !== "";

        if (isUserFiltered || isDateFiltered) {
            // Use filtered data
            postsToExport = filteredPosts;
            commentsToExport = filteredComments;
        } else {
            // Use all data
            postsToExport = wozcodePosts;
            commentsToExport = wozcodeComments;
        }

        // Prepare posts data for Excel
        const postsData = postsToExport.map((post) => ({
            Type: "Post",
            Username: post.username || "N/A",
            URL: post.url,
            "Date Created": formatDateTime(
                parseDate(post.createdAt || post.$createdAt),
            ),
            Platform: post.platform || "wozcode",
            ID: post.$id,
        }));

        // Prepare comments data for Excel
        const commentsData = commentsToExport.map((comment) => ({
            Type: "Comment",
            Username: comment.username || "N/A",
            URL: comment.url,
            "Date Created": formatDateTime(
                parseDate(comment.createdAt || comment.$createdAt),
            ),
            Platform: comment.platform || "wozcode",
            ID: comment.$id,
        }));

        // Combine both datasets
        const allData = [...postsData, ...commentsData];

        // Create filter info string
        let filterInfo = "";
        if (isUserFiltered && isDateFiltered) {
            filterInfo = `Filtered: User="${appliedUser}", Date="${appliedDate}"`;
        } else if (isUserFiltered) {
            filterInfo = `Filtered: User="${appliedUser}"`;
        } else if (isDateFiltered) {
            filterInfo = `Filtered: Date="${appliedDate}"`;
        } else {
            filterInfo = "No filters (All Data)";
        }

        // Create summary sheet with filtered counts
        const summaryData = [
            { Metric: "Filter Applied", Value: filterInfo },
            { Metric: "---", Value: "---" },
            { Metric: "Filtered Posts Count", Value: postsToExport.length },
            {
                Metric: "Filtered Comments Count",
                Value: commentsToExport.length,
            },
            {
                Metric: "Filtered Total Items",
                Value: postsToExport.length + commentsToExport.length,
            },
            { Metric: "---", Value: "---" },
            { Metric: "Total Posts (All)", Value: wozcodePosts.length },
            { Metric: "Total Comments (All)", Value: wozcodeComments.length },
            {
                Metric: "Total Items (All)",
                Value: wozcodePosts.length + wozcodeComments.length,
            },
            { Metric: "---", Value: "---" },
            { Metric: "Export Date", Value: new Date().toLocaleString() },
            { Metric: "Exported By", Value: user?.name || "Unknown" },
        ];

        // Create workbook
        const workbook = XLSX.utils.book_new();

        // Add main data sheet (only filtered data)
        const mainWorksheet = XLSX.utils.json_to_sheet(allData);
        XLSX.utils.book_append_sheet(workbook, mainWorksheet, "Filtered Data");

        // Add summary sheet
        const summaryWorksheet = XLSX.utils.json_to_sheet(summaryData);
        XLSX.utils.book_append_sheet(workbook, summaryWorksheet, "Summary");

        // Add separate sheets for filtered posts and comments
        const postsWorksheet = XLSX.utils.json_to_sheet(postsData);
        XLSX.utils.book_append_sheet(
            workbook,
            postsWorksheet,
            "Filtered Posts",
        );

        const commentsWorksheet = XLSX.utils.json_to_sheet(commentsData);
        XLSX.utils.book_append_sheet(
            workbook,
            commentsWorksheet,
            "Filtered Comments",
        );

        // Auto-size columns function
        const autoSizeColumns = (worksheet) => {
            if (!worksheet["!ref"]) return;
            const range = XLSX.utils.decode_range(worksheet["!ref"]);
            const columnWidths = {};

            for (let R = range.s.r; R <= range.e.r; ++R) {
                for (let C = range.s.c; C <= range.e.c; ++C) {
                    const cellAddress = XLSX.utils.encode_cell({ r: R, c: C });
                    const cell = worksheet[cellAddress];
                    if (cell && cell.v) {
                        const cellValue = cell.v.toString();
                        const cellLength = Math.max(cellValue.length, 10);
                        columnWidths[C] = Math.max(
                            columnWidths[C] || 0,
                            cellLength,
                        );
                    }
                }
            }

            worksheet["!cols"] = Object.values(columnWidths).map((width) => ({
                wch: Math.min(width + 2, 50),
            }));
        };

        // Auto-size all worksheets
        autoSizeColumns(mainWorksheet);
        autoSizeColumns(postsWorksheet);
        autoSizeColumns(commentsWorksheet);
        autoSizeColumns(summaryWorksheet);

        // Generate filename with filter info
        let fileName = `wozcode-data`;
        if (isUserFiltered) {
            fileName += `-${appliedUser.replace(/\s/g, "")}`;
        }
        if (isDateFiltered) {
            fileName += `-${appliedDate}`;
        }
        fileName += `-${new Date().toISOString().split("T")[0]}.xlsx`;

        // Clean filename (remove special characters)
        fileName = fileName.replace(/[^a-zA-Z0-9-.]/g, "");

        // Generate Excel file
        XLSX.writeFile(workbook, fileName);

        // Show success message with filter info
        let message = `✅ Excel file "${fileName}" has been downloaded successfully!\n\n`;
        message += `📊 Export Summary:\n`;
        message += `━ ━ ━ ━ ━ ━ ━ ━ ━ ━ ━ ━ ━\n`;
        message += `📝 Filtered Posts: ${postsToExport.length}\n`;
        message += `💬 Filtered Comments: ${commentsToExport.length}\n`;
        message += `📦 Total Filtered Items: ${postsToExport.length + commentsToExport.length}\n`;
        if (isUserFiltered) message += `👤 User Filter: ${appliedUser}\n`;
        if (isDateFiltered) message += `📅 Date Filter: ${appliedDate}\n`;
        message += `━ ━ ━ ━ ━ ━ ━ ━ ━ ━ ━ ━ ━\n`;
        message += `📈 Overall Statistics:\n`;
        message += `📝 Total Posts (All): ${wozcodePosts.length}\n`;
        message += `💬 Total Comments (All): ${wozcodeComments.length}\n`;
        message += `📦 Total Items (All): ${wozcodePosts.length + wozcodeComments.length}`;

        alert(message);
    };

    const hasActiveFilters = appliedUser !== "All Users" || appliedDate;

    return (
        <div className="wozcode-page">
            {/* Back Arrow and Header */}
            <div className="wozcode-page-header">
                <button
                    className="wozcode-back-btn"
                    onClick={() => navigate("/dashboard")}
                >
                    <ArrowLeft size={20} />
                    <span>Back to Dashboard</span>
                </button>
                <div className="wozcode-page-actions">
                    <button
                        className="wozcode-filter-btn"
                        onClick={() => setIsFilterModalOpen(true)}
                    >
                        <Calendar size={16} />
                    </button>
                    <button
                        className="wozcode-export-btn"
                        onClick={handleExport}
                    >
                        Export
                    </button>
                </div>
            </div>
            <div className="wozcode-page-title">
                <h2>Wozcode</h2>
            </div>

            {/* Error Display */}
            {error && (
                <div className="wozcode-error">
                    <AlertCircle size={20} />
                    <div>
                        <strong>Error:</strong> {error}
                    </div>
                    <button
                        onClick={fetchWozcodeData}
                        className="wozcode-retry-btn"
                    >
                        Retry
                    </button>
                </div>
            )}

            {/* Filter Modal */}
            {isFilterModalOpen && (
                <div
                    className="wozcode-modal-overlay"
                    onClick={() => setIsFilterModalOpen(false)}
                >
                    <div
                        className="wozcode-filter-modal"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="wozcode-modal-header">
                            <h3>Filter Records</h3>
                            <button
                                className="wozcode-close-modal"
                                onClick={() => setIsFilterModalOpen(false)}
                            >
                                <X size={18} />
                            </button>
                        </div>
                        <div className="wozcode-modal-body">
                            <div className="wozcode-filter-group">
                                <label>
                                    <User size={12} /> USER
                                </label>
                                <select
                                    value={tempUser}
                                    onChange={(e) =>
                                        setTempUser(e.target.value)
                                    }
                                >
                                    {uniqueUsernames.map((name) => (
                                        <option key={name} value={name}>
                                            {name}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div className="wozcode-filter-group">
                                <label>
                                    <Calendar size={12} /> DATE
                                </label>
                                <input
                                    type="date"
                                    value={tempDate}
                                    onChange={(e) =>
                                        setTempDate(e.target.value)
                                    }
                                />
                            </div>
                        </div>
                        <div className="wozcode-modal-footer">
                            <button
                                className="wozcode-reset-btn"
                                onClick={handleResetFilters}
                            >
                                Reset
                            </button>
                            <button
                                className="wozcode-apply-btn"
                                onClick={handleApplyFilters}
                            >
                                Apply
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Last Updated */}
            {!isLoading && !error && (
                <div className="wozcode-last-updated">
                    <Activity size={10} />
                    <span>Last synced {formatDateTime(new Date())}</span>
                </div>
            )}

            {/* Loading Indicator */}
            {isLoading && (
                <div className="wozcode-loading">
                    <div className="wozcode-spinner"></div>
                    <span>Loading your data...</span>
                </div>
            )}

            {/* Active Filters */}
            {hasActiveFilters && !error && (
                <div className="wozcode-active-filters">
                    <div className="wozcode-filter-tags">
                        {appliedUser !== "All Users" && (
                            <span className="wozcode-filter-tag">
                                {appliedUser}
                                <X
                                    size={10}
                                    onClick={() => setAppliedUser("All Users")}
                                />
                            </span>
                        )}
                        {appliedDate && (
                            <span className="wozcode-filter-tag">
                                {appliedDate}
                                <X
                                    size={10}
                                    onClick={() => setAppliedDate("")}
                                />
                            </span>
                        )}
                    </div>
                    <button
                        className="wozcode-clear-filters"
                        onClick={handleResetFilters}
                    >
                        Clear
                    </button>
                </div>
            )}

            {/* Stats Cards */}
            {!error && (
                <div className="wozcode-stats-cards">
                    <div className="wozcode-stat-card">
                        <div className="wozcode-stat-icon">
                            <LinkIcon size={18} />
                        </div>
                        <div className="wozcode-stat-info">
                            <span className="wozcode-stat-value">
                                {stats.totalPosts}
                            </span>
                            <span className="wozcode-stat-label">
                                Total Posts
                            </span>
                        </div>
                    </div>
                    <div className="wozcode-stat-card">
                        <div className="wozcode-stat-icon">
                            <MessageCircle size={18} />
                        </div>
                        <div className="wozcode-stat-info">
                            <span className="wozcode-stat-value">
                                {stats.totalComments}
                            </span>
                            <span className="wozcode-stat-label">
                                Total Comments
                            </span>
                        </div>
                    </div>
                    <div className="wozcode-stat-card">
                        <div className="wozcode-stat-icon">
                            <Zap size={18} />
                        </div>
                        <div className="wozcode-stat-info">
                            <span className="wozcode-stat-value">
                                {stats.totalTodays}
                            </span>
                            <span className="wozcode-stat-label">
                                Today's Activity
                            </span>
                        </div>
                    </div>
                </div>
            )}

            {/* View Toggle */}
            {!error && (
                <div className="wozcode-view-toggle">
                    <button
                        className={`wozcode-view-btn ${activeView === "posts" ? "active" : ""}`}
                        onClick={() => setActiveView("posts")}
                    >
                        <LinkIcon size={14} />
                        <span>Posts</span>
                        <span className="wozcode-count">
                            {filteredPosts.length}
                        </span>
                    </button>
                    <button
                        className={`wozcode-view-btn ${activeView === "comments" ? "active" : ""}`}
                        onClick={() => setActiveView("comments")}
                    >
                        <MessageCircle size={14} />
                        <span>Comments</span>
                        <span className="wozcode-count">
                            {filteredComments.length}
                        </span>
                    </button>
                </div>
            )}

            {/* Content Area */}
            {!error && (
                <div className="wozcode-content-area">
                    {/* Posts View */}
                    {activeView === "posts" && (
                        <div className="wozcode-view-content">
                            <div className="wozcode-view-header">
                                <h3>
                                    <LinkIcon size={14} /> Posts
                                    {stats.todaysPosts > 0 && (
                                        <span className="wozcode-today-badge">
                                            +{stats.todaysPosts} today
                                        </span>
                                    )}
                                </h3>
                                <button
                                    className="wozcode-add-btn"
                                    onClick={() => setShowPostInput(true)}
                                >
                                    <Plus size={14} />
                                </button>
                            </div>

                            {showPostInput && (
                                <form
                                    onSubmit={(e) =>
                                        handleAddTracker(e, "post")
                                    }
                                    className="wozcode-add-form"
                                >
                                    <input
                                        type="url"
                                        placeholder="Paste WOZCODE post URL (include http:// or https://)"
                                        value={postUrl}
                                        onChange={(e) =>
                                            setPostUrl(e.target.value)
                                        }
                                        required
                                        autoFocus
                                    />
                                    <div className="wozcode-form-actions">
                                        <button
                                            type="submit"
                                            className="wozcode-submit-btn"
                                        >
                                            Add Post
                                        </button>
                                        <button
                                            type="button"
                                            className="wozcode-cancel-btn"
                                            onClick={() =>
                                                setShowPostInput(false)
                                            }
                                        >
                                            Cancel
                                        </button>
                                    </div>
                                </form>
                            )}

                            <div className="wozcode-cards-list">
                                {filteredPosts.length === 0 ? (
                                    <div className="wozcode-empty-state">
                                        <Code size={40} />
                                        <p>No posts yet</p>
                                        <button
                                            onClick={() =>
                                                setShowPostInput(true)
                                            }
                                        >
                                            Add your first post
                                        </button>
                                    </div>
                                ) : (
                                    filteredPosts.map((item) => {
                                        const itemDate = parseDate(
                                            item.createdAt || item.$createdAt,
                                        );
                                        const isToday =
                                            itemDate.toDateString() ===
                                            today.toDateString();
                                        return (
                                            <div
                                                key={item.$id}
                                                className={`wozcode-card ${isToday ? "today" : ""}`}
                                            >
                                                <div className="wozcode-card-info">
                                                    <div className="wozcode-card-user">
                                                        <User size={12} />
                                                        <span className="wozcode-username">
                                                            {item.username}
                                                        </span>
                                                        <span className="wozcode-platform-badge">
                                                            WOZCODE
                                                        </span>
                                                    </div>
                                                    <div className="wozcode-card-time">
                                                        <Clock size={10} />
                                                        <span>
                                                            {formatDateTime(
                                                                itemDate,
                                                            )}
                                                        </span>
                                                        {isToday && (
                                                            <span className="wozcode-today-tag">
                                                                Today
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>
                                                <div className="wozcode-card-actions">
                                                    <button
                                                        onClick={() =>
                                                            handleVisit(
                                                                item.$id,
                                                                item.url,
                                                            )
                                                        }
                                                        className="wozcode-visit-btn"
                                                    >
                                                        Open
                                                    </button>
                                                    {item.username ===
                                                        user?.name && (
                                                        <button
                                                            onClick={() =>
                                                                handleDelete(
                                                                    item.$id,
                                                                    WOZCODE_POST_COLLECTION,
                                                                )
                                                            }
                                                            className="wozcode-delete-btn"
                                                        >
                                                            <Trash2 size={12} />
                                                        </button>
                                                    )}
                                                </div>
                                            </div>
                                        );
                                    })
                                )}
                            </div>
                        </div>
                    )}

                    {/* Comments View */}
                    {activeView === "comments" && (
                        <div className="wozcode-view-content">
                            <div className="wozcode-view-header">
                                <h3>
                                    <MessageCircle size={14} /> Comments
                                    {stats.todaysComments > 0 && (
                                        <span className="wozcode-today-badge">
                                            +{stats.todaysComments} today
                                        </span>
                                    )}
                                </h3>
                                <button
                                    className="wozcode-add-btn"
                                    onClick={() => setShowCommentInput(true)}
                                >
                                    <Plus size={14} />
                                </button>
                            </div>

                            {showCommentInput && (
                                <form
                                    onSubmit={(e) =>
                                        handleAddTracker(e, "comment")
                                    }
                                    className="wozcode-add-form"
                                >
                                    <input
                                        type="url"
                                        placeholder="Paste WOZCODE comment URL (include http:// or https://)"
                                        value={commentUrl}
                                        onChange={(e) =>
                                            setCommentUrl(e.target.value)
                                        }
                                        required
                                        autoFocus
                                    />
                                    <div className="wozcode-form-actions">
                                        <button
                                            type="submit"
                                            className="wozcode-submit-btn"
                                        >
                                            Add Comment
                                        </button>
                                        <button
                                            type="button"
                                            className="wozcode-cancel-btn"
                                            onClick={() =>
                                                setShowCommentInput(false)
                                            }
                                        >
                                            Cancel
                                        </button>
                                    </div>
                                </form>
                            )}

                            <div className="wozcode-cards-list">
                                {filteredComments.length === 0 ? (
                                    <div className="wozcode-empty-state">
                                        <MessageCircle size={40} />
                                        <p>No comments yet</p>
                                        <button
                                            onClick={() =>
                                                setShowCommentInput(true)
                                            }
                                        >
                                            Add your first comment
                                        </button>
                                    </div>
                                ) : (
                                    filteredComments.map((item) => {
                                        const itemDate = parseDate(
                                            item.createdAt || item.$createdAt,
                                        );
                                        const isToday =
                                            itemDate.toDateString() ===
                                            today.toDateString();
                                        return (
                                            <div
                                                key={item.$id}
                                                className={`wozcode-card ${isToday ? "today" : ""}`}
                                            >
                                                <div className="wozcode-card-info">
                                                    <div className="wozcode-card-user">
                                                        <User size={12} />
                                                        <span className="wozcode-username">
                                                            {item.username}
                                                        </span>
                                                        <span className="wozcode-platform-badge">
                                                            WOZCODE
                                                        </span>
                                                    </div>
                                                    <div className="wozcode-card-time">
                                                        <Clock size={10} />
                                                        <span>
                                                            {formatDateTime(
                                                                itemDate,
                                                            )}
                                                        </span>
                                                        {isToday && (
                                                            <span className="wozcode-today-tag">
                                                                Today
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>
                                                <div className="wozcode-card-actions">
                                                    <button
                                                        onClick={() =>
                                                            handleVisit(
                                                                item.$id,
                                                                item.url,
                                                            )
                                                        }
                                                        className="wozcode-visit-btn"
                                                    >
                                                        Open
                                                    </button>
                                                    {item.username ===
                                                        user?.name && (
                                                        <button
                                                            onClick={() =>
                                                                handleDelete(
                                                                    item.$id,
                                                                    WOZCODE_COMMENT_COLLECTION,
                                                                )
                                                            }
                                                            className="wozcode-delete-btn"
                                                        >
                                                            <Trash2 size={12} />
                                                        </button>
                                                    )}
                                                </div>
                                            </div>
                                        );
                                    })
                                )}
                            </div>
                        </div>
                    )}
                </div>
            )}

            {/* Back to Top Button */}
            {showBackToTop && (
                <button className="wozcode-back-to-top" onClick={scrollToTop}>
                    <ChevronUp size={20} />
                </button>
            )}
        </div>
    );
};

export default Wozcode;
