// Dashboard.jsx
import React, { useState, useEffect, useMemo } from "react";
import { Link } from "react-router-dom";
import { databases, ID } from "../appwrite"; // Keep this import for create/delete operations
import { useAuth } from "../context/AuthContext";
import { useData } from "../context/DataContext";
import {
    User,
    Link as LinkIcon,
    Trash2,
    Plus,
    Clock,
    Calendar,
    X,
    Facebook,
    MessageSquare,
    Activity,
    MessageCircle,
    ChevronUp,
    DollarSign,
} from "lucide-react";
import NavBar from "./NavBar";
import "./Dashboard.css";

const Dashboard = () => {
    const { user, logout } = useAuth();
    const { posts, comments, isLoading, lastUpdated, fetchData, handleExport } =
        useData();

    const [postUrl, setPostUrl] = useState("");
    const [commentUrl, setCommentUrl] = useState("");
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);
    const [visitedLinks, setVisitedLinks] = useState([]);
    const [currentTime, setCurrentTime] = useState(new Date());
    const [showBackToTop, setShowBackToTop] = useState(false);

    const [showPostInput, setShowPostInput] = useState(false);
    const [showCommentInput, setShowCommentInput] = useState(false);
    const [activeView, setActiveView] = useState("posts");

    const [platform, setPlatform] = useState("reddit");

    // Filter States
    const [tempUser, setTempUser] = useState("All Users");
    const [tempDate, setTempDate] = useState("");
    const [appliedUser, setAppliedUser] = useState("All Users");
    const [appliedDate, setAppliedDate] = useState("");

    const DB_ID = "699d8e26001498ef3487";
    const POST_COLLECTION = "posts";
    const COMMENT_COLLECTION = "comments";

    // Update current time every second
    useEffect(() => {
        const timer = setInterval(() => {
            setCurrentTime(new Date());
        }, 1000);
        return () => clearInterval(timer);
    }, []);

    // Add scroll listener for back to top button
    useEffect(() => {
        const handleScroll = () => {
            setShowBackToTop(window.scrollY > 400);
        };

        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    useEffect(() => {
        const saved = localStorage.getItem("visitedLinks");
        if (saved) setVisitedLinks(JSON.parse(saved));
    }, []);

    const parseDate = (dateString) => {
        if (!dateString) return new Date(0);
        let date = new Date(dateString);
        if (isNaN(date.getTime())) {
            // Match format: MM/DD/YYYY, HH:MM:SS AM/PM
            const match = dateString.match(
                /(\d{1,2})\/(\d{1,2})\/(\d{4}),?\s*(\d{1,2}):(\d{2}):(\d{2})\s*(AM|PM)?/i,
            );
            if (match) {
                const month = parseInt(match[1]);
                const day = parseInt(match[2]);
                const year = parseInt(match[3]);
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

            // Match format: YYYY-MM-DD, HH:MM:SS AM/PM
            const match2 = dateString.match(
                /(\d{4})-(\d{2})-(\d{2}),?\s*(\d{1,2}):(\d{2}):(\d{2})\s*(AM|PM)?/i,
            );
            if (match2) {
                const year = parseInt(match2[1]);
                const month = parseInt(match2[2]);
                const day = parseInt(match2[3]);
                let hours = parseInt(match2[4]);
                const minutes = parseInt(match2[5]);
                const seconds = parseInt(match2[6]);
                const ampm = match2[7];

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

    const formatDateOnly = (date) => {
        if (!date) return "N/A";
        return new Date(date).toLocaleString("en-US", {
            year: "numeric",
            month: "short",
            day: "numeric",
        });
    };

    const getGreeting = () => {
        const hour = currentTime.getHours();
        if (hour >= 0 && hour < 12) return "Good Morning";
        if (hour >= 12 && hour < 17) return "Good Afternoon";
        if (hour >= 17 && hour < 21) return "Good Evening";
        return "Good Night";
    };

    const uniqueUsernames = useMemo(() => {
        const allItems = [...posts, ...comments];
        const names = allItems.map((item) => item.username).filter(Boolean);
        return ["All Users", ...new Set(names)];
    }, [posts, comments]);

    const filteredPosts = useMemo(() => {
        return posts
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
                const itemPlatform = item.platform || "reddit";
                const matchesPlatform = itemPlatform === platform;
                return matchesUser && matchesDate && matchesPlatform;
            })
            .sort((a, b) => {
                const dateA = parseDate(a.createdAt || a.$createdAt);
                const dateB = parseDate(b.createdAt || b.$createdAt);
                return dateB - dateA;
            });
    }, [posts, appliedUser, appliedDate, platform]);

    const filteredComments = useMemo(() => {
        return comments
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
                const itemPlatform = item.platform || "reddit";
                const matchesPlatform = itemPlatform === platform;
                return matchesUser && matchesDate && matchesPlatform;
            })
            .sort((a, b) => {
                const dateA = parseDate(a.createdAt || a.$createdAt);
                const dateB = parseDate(b.createdAt || b.$createdAt);
                return dateB - dateA;
            });
    }, [comments, appliedUser, appliedDate, platform]);

    const today = new Date();
    const todaysPosts = filteredPosts.filter((item) => {
        const itemDate = parseDate(item.createdAt || item.$createdAt);
        return itemDate.toDateString() === today.toDateString();
    });

    const todaysComments = filteredComments.filter((item) => {
        const itemDate = parseDate(item.createdAt || item.$createdAt);
        return itemDate.toDateString() === today.toDateString();
    });

    const stats = useMemo(() => {
        const totalPosts = posts.length;
        const totalComments = comments.length;
        return {
            totalPosts,
            totalComments,
            todaysPosts: todaysPosts.length,
            todaysComments: todaysComments.length,
            totalTodays: todaysPosts.length + todaysComments.length,
        };
    }, [posts, comments, todaysPosts, todaysComments]);

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
            localStorage.setItem("visitedLinks", JSON.stringify(updated));
        }
        window.open(url, "_blank");
    };

    const handleAddTracker = async (e, type) => {
        e.preventDefault();
        const url = type === "post" ? postUrl : commentUrl;
        const collection =
            type === "post" ? POST_COLLECTION : COMMENT_COLLECTION;

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
            // Use the current time from dashboard state (live updating)
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

            console.log("Saving with date/time:", fullDate); // Debug log

            const documentData = {
                url: url,
                username: user?.name,
                createdAt: fullDate,
                platform: platform,
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

            // Show success message
            alert(
                `${type === "post" ? "Post" : "Comment"} added successfully at ${fullDate}`,
            );

            // Refresh data using the context's fetchData
            await fetchData();

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
            await fetchData(); // Refresh data after deletion
        } catch (err) {
            console.error("Delete failed:", err);
            alert("Delete failed: " + err.message);
        }
    };

    const scrollToTop = () => {
        window.scrollTo({
            top: 0,
            behavior: "smooth",
        });
    };

    const hasActiveFilters = appliedUser !== "All Users" || appliedDate;

    return (
        <div className="dashboard-container">
            <NavBar
                onRefresh={fetchData}
                isLoading={isLoading}
                onFilterClick={() => setIsFilterModalOpen(true)}
                hasActiveFilters={hasActiveFilters}
                onMenuClick={() => setIsMenuOpen(true)}
                onExport={handleExport}
            />

            {/* Filter Modal */}
            {isFilterModalOpen && (
                <div
                    className="modal-overlay"
                    onClick={() => setIsFilterModalOpen(false)}
                >
                    <div
                        className="filter-modal"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="modal-header">
                            <h3>Filter Records</h3>
                            <button
                                className="close-modal"
                                onClick={() => setIsFilterModalOpen(false)}
                            >
                                <X size={20} />
                            </button>
                        </div>
                        <div className="modal-body">
                            <div className="filter-group">
                                <label>
                                    <User size={14} /> USER
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
                            <div className="filter-group">
                                <label>
                                    <Calendar size={14} /> DATE
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
                        <div className="modal-footer">
                            <button
                                className="reset-btn"
                                onClick={handleResetFilters}
                            >
                                Reset
                            </button>
                            <button
                                className="apply-btn"
                                onClick={handleApplyFilters}
                            >
                                Apply
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Current Time Card */}
            <div className="time-card">
                <div className="greeting">
                    {getGreeting()}, {user?.name}!
                </div>
                <div className="current-date">
                    <Calendar size={14} />
                    {formatDateOnly(currentTime)}
                </div>
            </div>

            {/* Last Updated */}
            {lastUpdated && (
                <div className="last-updated">
                    <Activity size={12} />
                    <span>Last synced {formatDateTime(lastUpdated)}</span>
                </div>
            )}

            {/* Active Filters */}
            {hasActiveFilters && (
                <div className="active-filters">
                    <div className="filter-tags">
                        {appliedUser !== "All Users" && (
                            <span className="filter-tag">
                                {appliedUser}
                                <X
                                    size={12}
                                    onClick={() => setAppliedUser("All Users")}
                                />
                            </span>
                        )}
                        {appliedDate && (
                            <span className="filter-tag">
                                {appliedDate}
                                <X
                                    size={12}
                                    onClick={() => setAppliedDate("")}
                                />
                            </span>
                        )}
                    </div>
                    <button
                        className="clear-filters"
                        onClick={handleResetFilters}
                    >
                        Clear
                    </button>
                </div>
            )}

            {/* View Toggle */}
            <div className="view-toggle-container">
                <button
                    className={`view-toggle-btn ${activeView === "posts" ? "active" : ""}`}
                    onClick={() => setActiveView("posts")}
                >
                    <LinkIcon size={18} />
                    <span>Posts</span>
                    <span className="count">{filteredPosts.length}</span>
                </button>
                <button
                    className={`view-toggle-btn ${activeView === "comments" ? "active" : ""}`}
                    onClick={() => setActiveView("comments")}
                >
                    <MessageCircle size={18} />
                    <span>Comments</span>
                    <span className="count">{filteredComments.length}</span>
                </button>
            </div>

            {/* Content Area */}
            <div className="content-area">
                {/* Posts View */}
                {activeView === "posts" && (
                    <div className="view-content">
                        <div className="view-header">
                            <h3>
                                <LinkIcon size={20} /> Posts
                                {stats.todaysPosts > 0 && (
                                    <span className="today-badge">
                                        +{stats.todaysPosts} today
                                    </span>
                                )}
                            </h3>
                            <button
                                className="add-btn"
                                onClick={() => setShowPostInput(true)}
                            >
                                <Plus size={18} />
                            </button>
                        </div>

                        {showPostInput && (
                            <form
                                onSubmit={(e) => handleAddTracker(e, "post")}
                                className="add-form"
                            >
                                <input
                                    type="url"
                                    placeholder="Paste URL (include http:// or https://)"
                                    value={postUrl}
                                    onChange={(e) => setPostUrl(e.target.value)}
                                    required
                                    autoFocus
                                />
                                <div className="form-actions">
                                    <button
                                        type="submit"
                                        className="submit-btn"
                                    >
                                        Add Post
                                    </button>
                                    <button
                                        type="button"
                                        className="cancel-btn"
                                        onClick={() => setShowPostInput(false)}
                                    >
                                        Cancel
                                    </button>
                                </div>
                            </form>
                        )}

                        <div className="cards-list">
                            {filteredPosts.length === 0 ? (
                                <div className="empty-state">
                                    <LinkIcon size={48} />
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
                                            className={`card ${isToday ? "today" : ""}`}
                                        >
                                            <div className="card-info">
                                                <div className="card-user">
                                                    <User size={14} />
                                                    <span className="username">
                                                        {item.username}
                                                    </span>
                                                    <span
                                                        className="platform-badge"
                                                        data-platform={
                                                            item.platform ||
                                                            "reddit"
                                                        }
                                                    >
                                                        {item.platform ||
                                                            "reddit"}
                                                    </span>
                                                </div>
                                                <div className="card-time">
                                                    <Clock size={12} />
                                                    <span>
                                                        {formatDateTime(
                                                            itemDate,
                                                        )}
                                                    </span>
                                                    {isToday && (
                                                        <span className="today-tag">
                                                            Today
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                            <div className="card-actions">
                                                <button
                                                    onClick={() =>
                                                        handleVisit(
                                                            item.$id,
                                                            item.url,
                                                        )
                                                    }
                                                    className="visit-btn"
                                                >
                                                    Open
                                                </button>
                                                {item.username ===
                                                    user?.name && (
                                                    <button
                                                        onClick={() =>
                                                            handleDelete(
                                                                item.$id,
                                                                POST_COLLECTION,
                                                            )
                                                        }
                                                        className="delete-btn"
                                                    >
                                                        <Trash2 size={16} />
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
                    <div className="view-content">
                        <div className="view-header">
                            <h3>
                                <MessageCircle size={20} /> Comments
                                {stats.todaysComments > 0 && (
                                    <span className="today-badge">
                                        +{stats.todaysComments} today
                                    </span>
                                )}
                            </h3>
                            <button
                                className="add-btn"
                                onClick={() => setShowCommentInput(true)}
                            >
                                <Plus size={18} />
                            </button>
                        </div>

                        {showCommentInput && (
                            <form
                                onSubmit={(e) => handleAddTracker(e, "comment")}
                                className="add-form"
                            >
                                <input
                                    type="url"
                                    placeholder="Paste URL (include http:// or https://)"
                                    value={commentUrl}
                                    onChange={(e) =>
                                        setCommentUrl(e.target.value)
                                    }
                                    required
                                    autoFocus
                                />
                                <div className="form-actions">
                                    <button
                                        type="submit"
                                        className="submit-btn"
                                    >
                                        Add Comment
                                    </button>
                                    <button
                                        type="button"
                                        className="cancel-btn"
                                        onClick={() =>
                                            setShowCommentInput(false)
                                        }
                                    >
                                        Cancel
                                    </button>
                                </div>
                            </form>
                        )}

                        <div className="cards-list">
                            {filteredComments.length === 0 ? (
                                <div className="empty-state">
                                    <MessageCircle size={48} />
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
                                            className={`card ${isToday ? "today" : ""}`}
                                        >
                                            <div className="card-info">
                                                <div className="card-user">
                                                    <User size={14} />
                                                    <span className="username">
                                                        {item.username}
                                                    </span>
                                                    <span
                                                        className="platform-badge"
                                                        data-platform={
                                                            item.platform ||
                                                            "reddit"
                                                        }
                                                    >
                                                        {item.platform ||
                                                            "reddit"}
                                                    </span>
                                                </div>
                                                <div className="card-time">
                                                    <Clock size={12} />
                                                    <span>
                                                        {formatDateTime(
                                                            itemDate,
                                                        )}
                                                    </span>
                                                    {isToday && (
                                                        <span className="today-tag">
                                                            Today
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                            <div className="card-actions">
                                                <button
                                                    onClick={() =>
                                                        handleVisit(
                                                            item.$id,
                                                            item.url,
                                                        )
                                                    }
                                                    className="visit-btn"
                                                >
                                                    Open
                                                </button>
                                                {item.username ===
                                                    user?.name && (
                                                    <button
                                                        onClick={() =>
                                                            handleDelete(
                                                                item.$id,
                                                                COMMENT_COLLECTION,
                                                            )
                                                        }
                                                        className="delete-btn"
                                                    >
                                                        <Trash2 size={16} />
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

            {/* Platform Toggle */}
            <div className="platform-toggle-container">
                <button
                    className={`platform-btn ${platform === "reddit" ? "active" : ""}`}
                    onClick={() => setPlatform("reddit")}
                >
                    <MessageSquare size={16} /> Reddit
                </button>
                <button
                    className={`platform-btn ${platform === "facebook" ? "active" : ""}`}
                    onClick={() => setPlatform("facebook")}
                >
                    <Facebook size={16} /> Facebook
                </button>
            </div>

            {/* Back to Top Button */}
            {showBackToTop && (
                <button
                    className="back-to-top"
                    onClick={scrollToTop}
                    aria-label="Back to top"
                >
                    <ChevronUp size={24} />
                </button>
            )}

            {/* Mobile Menu */}
            <div className={`mobile-menu ${isMenuOpen ? "open" : ""}`}>
                <div className="menu-header">
                    <h3>Menu</h3>
                    <button onClick={() => setIsMenuOpen(false)}>
                        <X size={24} />
                    </button>
                </div>
                <div className="menu-user">
                    <div className="avatar">
                        <User size={32} />
                    </div>
                    <span>{user?.name}</span>
                </div>
                {/* Payment Dashboard Link */}
                <Link
                    to="/payments"
                    className="menu-payment-link"
                    onClick={() => setIsMenuOpen(false)}
                >
                    <DollarSign size={18} />
                    Payment & Work Summary
                </Link>

                <div className="menu-stats">
                    <div className="menu-stat">
                        <span>Posts</span>
                        <strong>{stats.totalPosts}</strong>
                    </div>
                    <div className="menu-stat">
                        <span>Comments</span>
                        <strong>{stats.totalComments}</strong>
                    </div>
                    <div className="menu-stat">
                        <span>Today</span>
                        <strong>{stats.totalTodays}</strong>
                    </div>
                </div>
                <div className="menu-time">
                    <Clock size={16} />
                    <span>{formatDateTime(currentTime)}</span>
                </div>

                <button onClick={logout} className="menu-logout">
                    Logout
                </button>
            </div>

            {isMenuOpen && (
                <div
                    className="overlay"
                    onClick={() => setIsMenuOpen(false)}
                ></div>
            )}
        </div>
    );
};

export default Dashboard;
