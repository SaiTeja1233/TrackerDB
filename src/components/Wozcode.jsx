// Wozcode.jsx
import React, { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { databases, ID } from "../appwrite";
import { useAuth } from "../context/AuthContext";
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

    // Filter States
    const [tempUser, setTempUser] = useState("All Users");
    const [tempDate, setTempDate] = useState("");
    const [appliedUser, setAppliedUser] = useState("All Users");
    const [appliedDate, setAppliedDate] = useState("");

    // Database configuration
    const DB_ID = "699d8e26001498ef3487";
    const WOZCODE_POST_COLLECTION = "wozcode_posts";
    const WOZCODE_COMMENT_COLLECTION = "wozcode_comments";

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

    // Fetch Wozcode data
    const fetchWozcodeData = async () => {
        setIsLoading(true);
        try {
            // Fetch posts
            const postsResponse = await databases.listDocuments(
                DB_ID,
                WOZCODE_POST_COLLECTION,
            );
            setWozcodePosts(postsResponse.documents);

            // Fetch comments
            const commentsResponse = await databases.listDocuments(
                DB_ID,
                WOZCODE_COMMENT_COLLECTION,
            );
            setWozcodeComments(commentsResponse.documents);
        } catch (err) {
            console.error("Error fetching Wozcode data:", err);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchWozcodeData();
    }, []);

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
                    const itemDate = parseDate(item.createdAt);
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
                    const itemDate = parseDate(item.createdAt);
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

            await databases.createDocument(
                DB_ID,
                collection,
                ID.unique(),
                documentData,
            );

            // Clear form
            if (type === "post") {
                setPostUrl("");
                setShowPostInput(false);
            } else {
                setCommentUrl("");
                setShowCommentInput(false);
            }

            alert(
                `${type === "post" ? "Post" : "Comment"} added successfully at ${fullDate}`,
            );

            // Refresh data
            await fetchWozcodeData();

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
            await fetchWozcodeData();
        } catch (err) {
            console.error("Delete failed:", err);
            alert("Delete failed: " + err.message);
        }
    };

    const scrollToTop = () => {
        window.scrollTo({ top: 0, behavior: "smooth" });
    };

    const handleExport = () => {
        const data = {
            posts: wozcodePosts,
            comments: wozcodeComments,
            exportedAt: new Date().toISOString(),
        };
        const blob = new Blob([JSON.stringify(data, null, 2)], {
            type: "application/json",
        });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `wozcode-data-${new Date().toISOString().split("T")[0]}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
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
            {!isLoading && (
                <div className="wozcode-last-updated">
                    <Activity size={10} />
                    <span>Last synced {formatDateTime(new Date())}</span>
                </div>
            )}

            {/* Active Filters */}
            {hasActiveFilters && (
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
            <div className="wozcode-stats-cards">
                <div className="wozcode-stat-card">
                    <div className="wozcode-stat-icon">
                        <LinkIcon size={18} />
                    </div>
                    <div className="wozcode-stat-info">
                        <span className="wozcode-stat-value">
                            {stats.totalPosts}
                        </span>
                        <span className="wozcode-stat-label">Total Posts</span>
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

            {/* View Toggle */}
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

            {/* Content Area */}
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
                                onSubmit={(e) => handleAddTracker(e, "post")}
                                className="wozcode-add-form"
                            >
                                <input
                                    type="url"
                                    placeholder="Paste WOZCODE post URL (include http:// or https://)"
                                    value={postUrl}
                                    onChange={(e) => setPostUrl(e.target.value)}
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
                                        onClick={() => setShowPostInput(false)}
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
                                        onClick={() => setShowPostInput(true)}
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
                                onSubmit={(e) => handleAddTracker(e, "comment")}
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
