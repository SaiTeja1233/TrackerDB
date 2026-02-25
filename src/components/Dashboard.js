import React, { useState, useEffect, useMemo } from "react";
import { databases, ID } from "../appwrite";
import { useAuth } from "../context/AuthContext";
import {
    ExternalLink,
    User,
    Link as LinkIcon,
    Trash2,
    Plus,
    Clock,
    BarChart3,
    ChevronUp,
    ChevronDown,
    Filter,
    Calendar,
    X,
} from "lucide-react";
import "./Dashboard.css";

const Dashboard = () => {
    const { user, logout } = useAuth();
    const [postUrl, setPostUrl] = useState("");
    const [commentUrl, setCommentUrl] = useState("");
    const [posts, setPosts] = useState([]);
    const [comments, setComments] = useState([]);
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);
    const [visitedLinks, setVisitedLinks] = useState([]);

    const [showPostInput, setShowPostInput] = useState(false);
    const [showCommentInput, setShowCommentInput] = useState(false);
    const [activeTab, setActiveTab] = useState("posts");

    // Filter States
    const [tempUser, setTempUser] = useState("All Users");
    const [tempDate, setTempDate] = useState("");
    const [appliedUser, setAppliedUser] = useState("All Users");
    const [appliedDate, setAppliedDate] = useState("");

    const DB_ID = "699d8e26001498ef3487";
    const POST_COLLECTION = "posts";
    const COMMENT_COLLECTION = "comments";

    const uniqueUsernames = useMemo(() => {
        const allItems = [...posts, ...comments];
        const names = allItems.map((item) => item.username);
        return ["All Users", ...new Set(names)];
    }, [posts, comments]);

    const filteredPosts = useMemo(() => {
        return posts.filter((item) => {
            const matchesUser =
                appliedUser === "All Users" || item.username === appliedUser;
            const matchesDate =
                !appliedDate || item.createdAt.includes(appliedDate);
            return matchesUser && matchesDate;
        });
    }, [posts, appliedUser, appliedDate]);

    const filteredComments = useMemo(() => {
        return comments.filter((item) => {
            const matchesUser =
                appliedUser === "All Users" || item.username === appliedUser;
            const matchesDate =
                !appliedDate || item.createdAt.includes(appliedDate);
            return matchesUser && matchesDate;
        });
    }, [comments, appliedUser, appliedDate]);

    const stats = useMemo(() => {
        const totalPosts = posts.length;
        const totalComments = comments.length;
        const allItems = [...posts, ...comments];
        const engagedCount = allItems.filter(
            (item) =>
                item.username === user.name && visitedLinks.includes(item.$id),
        ).length;
        return { totalPosts, totalComments, engagedCount };
    }, [posts, comments, visitedLinks, user.name]);

    useEffect(() => {
        const saved = localStorage.getItem("visitedLinks");
        if (saved) setVisitedLinks(JSON.parse(saved));
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const p = await databases.listDocuments(DB_ID, POST_COLLECTION);
            const c = await databases.listDocuments(DB_ID, COMMENT_COLLECTION);
            setPosts(p.documents);
            setComments(c.documents);
        } catch (err) {
            console.error("Fetch Error:", err);
        }
    };

    const handleApplyFilters = () => {
        setAppliedUser(tempUser);
        setAppliedDate(tempDate);
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
        try {
            const now = new Date();
            const dateString = now.toISOString().split("T")[0];
            const fullDate = `${dateString}, ${now.toLocaleTimeString()}`;
            await databases.createDocument(DB_ID, collection, ID.unique(), {
                url: url,
                username: user.name,
                createdAt: fullDate,
            });
            type === "post" ? setPostUrl("") : setCommentUrl("");
            type === "post"
                ? setShowPostInput(false)
                : setShowCommentInput(false);
            fetchData();
        } catch (err) {
            alert("Tracking failed: " + err.message);
        }
    };

    const handleDelete = async (docId, collection) => {
        if (!window.confirm("Delete this link?")) return;
        try {
            await databases.deleteDocument(DB_ID, collection, docId);
            fetchData();
        } catch (err) {
            alert("Delete failed: " + err.message);
        }
    };

    return (
        <div className="dashboard-container">
            <nav className="navbar">
                <div className="nav-left">
                    <h2 className="logo">TrackerDB</h2>
                </div>
                <div className="nav-right">
                    <button
                        className="filter-nav-btn"
                        onClick={() => setIsFilterModalOpen(true)}
                    >
                        <Filter size={18} /> <span>Filter</span>
                    </button>
                    <button
                        onClick={logout}
                        className="logout-btn desktop-only"
                    >
                        Logout
                    </button>
                    <div className="menu-wrapper mobile-only">
                        <button
                            className="arrow-trigger-btn"
                            onClick={() => setIsMenuOpen(true)}
                        >
                            <ChevronUp size={24} />
                        </button>
                    </div>
                </div>
            </nav>

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
                                onClick={() => {
                                    setTempUser("All Users");
                                    setTempDate("");
                                }}
                            >
                                Reset
                            </button>
                            <button
                                className="apply-btn"
                                onClick={handleApplyFilters}
                            >
                                Apply Filters
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <header className="welcome-section animated-fade">
                <div className="welcome-content">
                    <h1>
                        Welcome, <span>{user?.name}</span>
                    </h1>
                    <p>
                        Track and manage your social media engagement
                        effectively.
                    </p>
                </div>
            </header>

            <div className="slider-wrapper mobile-only">
                <div className="radio-group">
                    <div
                        className={`slider-thumb ${activeTab === "comments" ? "slide-right" : ""}`}
                    ></div>
                    <div className="radio-option">
                        <input
                            type="radio"
                            id="p-tab"
                            checked={activeTab === "posts"}
                            onChange={() => setActiveTab("posts")}
                        />
                        <label htmlFor="p-tab" className="radio-label">
                            Posts
                        </label>
                    </div>
                    <div className="radio-option">
                        <input
                            type="radio"
                            id="c-tab"
                            checked={activeTab === "comments"}
                            onChange={() => setActiveTab("comments")}
                        />
                        <label htmlFor="c-tab" className="radio-label">
                            Comments
                        </label>
                    </div>
                </div>
            </div>

            <div className="tracker-grid">
                <div
                    className={`tracker-column ${activeTab !== "posts" ? "hide-on-mobile" : ""}`}
                >
                    <div className="column-header">
                        <h3>
                            <LinkIcon size={20} color="#4f46e5" /> Posts
                        </h3>
                        <button
                            className="add-btn-round"
                            onClick={() => setShowPostInput(true)}
                        >
                            <Plus />
                        </button>
                    </div>
                    {showPostInput && (
                        <div className="floating-form-container animated-fade">
                            <form
                                onSubmit={(e) => handleAddTracker(e, "post")}
                                className="tracker-form"
                            >
                                <input
                                    type="url"
                                    placeholder="Paste Post URL..."
                                    value={postUrl}
                                    onChange={(e) => setPostUrl(e.target.value)}
                                    required
                                    autoFocus
                                />
                                <div className="form-actions">
                                    <button type="submit">Track</button>
                                    <button
                                        type="button"
                                        className="cancel-btn"
                                        onClick={() => setShowPostInput(false)}
                                    >
                                        Cancel
                                    </button>
                                </div>
                            </form>
                        </div>
                    )}
                    <div className="cards-list">
                        {filteredPosts.map((item) => (
                            <LinkCard
                                key={item.$id}
                                data={item}
                                currentUser={user.name}
                                isNew={
                                    item.username !== user.name &&
                                    !visitedLinks.includes(item.$id)
                                }
                                onVisit={() => handleVisit(item.$id, item.url)}
                                onDelete={() =>
                                    handleDelete(item.$id, POST_COLLECTION)
                                }
                            />
                        ))}
                    </div>
                </div>

                <div
                    className={`tracker-column ${activeTab !== "comments" ? "hide-on-mobile" : ""}`}
                >
                    <div className="column-header">
                        <h3>
                            <Clock size={20} color="#0891b2" /> Comments
                        </h3>
                        <button
                            className="add-btn-round alt"
                            onClick={() => setShowCommentInput(true)}
                        >
                            <Plus />
                        </button>
                    </div>
                    {showCommentInput && (
                        <div className="floating-form-container animated-fade">
                            <form
                                onSubmit={(e) => handleAddTracker(e, "comment")}
                                className="tracker-form"
                            >
                                <input
                                    type="url"
                                    placeholder="Paste Comment URL..."
                                    value={commentUrl}
                                    onChange={(e) =>
                                        setCommentUrl(e.target.value)
                                    }
                                    required
                                    autoFocus
                                />
                                <div className="form-actions">
                                    <button type="submit">Track</button>
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
                        </div>
                    )}
                    <div className="cards-list">
                        {filteredComments.map((item) => (
                            <LinkCard
                                key={item.$id}
                                data={item}
                                currentUser={user.name}
                                isNew={
                                    item.username !== user.name &&
                                    !visitedLinks.includes(item.$id)
                                }
                                onVisit={() => handleVisit(item.$id, item.url)}
                                onDelete={() =>
                                    handleDelete(item.$id, COMMENT_COLLECTION)
                                }
                            />
                        ))}
                    </div>
                </div>
            </div>

            <div className={`bottom-sheet ${isMenuOpen ? "open" : ""}`}>
                <button
                    className="arrow-close-btn"
                    onClick={() => setIsMenuOpen(false)}
                >
                    <ChevronDown size={28} />
                </button>
                <div className="user-profile">
                    <div className="avatar-circle">
                        <User size={40} />
                    </div>
                    <p className="drawer-username">{user?.name}</p>
                </div>
                <div className="drawer-stats-container">
                    <div className="drawer-stat-row">
                        <div className="drawer-stat-icon post-icon">
                            <LinkIcon size={18} />
                        </div>
                        <div className="drawer-stat-info">
                            <span>Total Posts</span>
                            <strong>{stats.totalPosts}</strong>
                        </div>
                    </div>
                    <div className="drawer-stat-row">
                        <div className="drawer-stat-icon comment-icon">
                            <Clock size={18} />
                        </div>
                        <div className="drawer-stat-info">
                            <span>Total Comments</span>
                            <strong>{stats.totalComments}</strong>
                        </div>
                    </div>
                    <div className="drawer-stat-row">
                        <div className="drawer-stat-icon engage-icon">
                            <BarChart3 size={18} />
                        </div>
                        <div className="drawer-stat-info">
                            <span>Your Engagements</span>
                            <strong className="engaged-text">
                                {stats.engagedCount}
                            </strong>
                        </div>
                    </div>
                </div>
                <button onClick={logout} className="logout-btn-full">
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

const LinkCard = ({ data, currentUser, isNew, onVisit, onDelete }) => (
    <div className="tracker-card animated-fade">
        {isNew && <span className="new-badge">New</span>}
        <div className="card-top">
            <p className="card-user">
                <User size={14} /> {data.username}
            </p>
            <span className="card-date">{data.createdAt?.split(",")[0]}</span>
        </div>
        <div className="card-actions">
            <button onClick={onVisit} className="visit-btn">
                Open Link <ExternalLink size={14} />
            </button>
            {data.username === currentUser && (
                <button onClick={onDelete} className="delete-icon-btn">
                    <Trash2 size={18} />
                </button>
            )}
        </div>
    </div>
);

export default Dashboard;
