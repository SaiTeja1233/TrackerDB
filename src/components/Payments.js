// src/components/Payments.js
import React, { useState, useMemo } from "react";
import { useData } from "../context/DataContext";
import { ArrowLeft, Download, Calendar, User } from "lucide-react";
import { Link } from "react-router-dom";
import * as XLSX from "xlsx";
import "./Payments.css";

const Payments = () => {
    const { posts, comments } = useData();
    const [selectedPeriod, setSelectedPeriod] = useState("current");

    // Define periods with dynamic date handling
    const getPeriods = () => {
        const now = new Date();
        const currentYear = now.getFullYear();

        // Calculate current cycle (Mar 24th to Apr 24th)
        let currentStartDate = new Date(currentYear, 2, 24); // March 24
        let currentEndDate = new Date(currentYear, 3, 24); // April 24

        // If we're past April 24, use next year's dates
        if (now > currentEndDate) {
            currentStartDate = new Date(currentYear + 1, 2, 24);
            currentEndDate = new Date(currentYear + 1, 3, 24);
        }

        // Calculate previous cycle (Feb 24th to Mar 24th)
        let previousStartDate = new Date(currentYear, 1, 24); // February 24
        let previousEndDate = new Date(currentYear, 2, 24); // March 24

        // If current cycle is in next year, previous cycle should be in current year
        if (currentStartDate.getFullYear() > currentYear) {
            previousStartDate = new Date(currentYear, 1, 24);
            previousEndDate = new Date(currentYear, 2, 24);
        }

        return {
            previous: {
                name: `${getMonthName(previousStartDate.getMonth())} ${previousStartDate.getDate()}th - ${getMonthName(previousEndDate.getMonth())} ${previousEndDate.getDate()}th`,
                shortName: `${getMonthName(previousStartDate.getMonth())} ${previousStartDate.getDate()} - ${getMonthName(previousEndDate.getMonth())} ${previousEndDate.getDate()}`,
                startDate: previousStartDate,
                endDate: previousEndDate,
                status: "completed",
            },
            current: {
                name: `${getMonthName(currentStartDate.getMonth())} ${currentStartDate.getDate()}th - ${getMonthName(currentEndDate.getMonth())} ${currentEndDate.getDate()}th`,
                shortName: `${getMonthName(currentStartDate.getMonth())} ${currentStartDate.getDate()} - ${getMonthName(currentEndDate.getMonth())} ${currentEndDate.getDate()}`,
                startDate: currentStartDate,
                endDate: currentEndDate,
                status: "current",
            },
        };
    };

    const getMonthName = (monthIndex) => {
        const months = [
            "Jan",
            "Feb",
            "Mar",
            "Apr",
            "May",
            "Jun",
            "Jul",
            "Aug",
            "Sep",
            "Oct",
            "Nov",
            "Dec",
        ];
        return months[monthIndex];
    };

    const periods = getPeriods();
    const periodInfo = periods[selectedPeriod];

    // Filter data based on selected period
    const getFilteredData = (period) => {
        const periodData = periods[period];
        if (!periodData) return { posts: [], comments: [] };

        const filteredPosts = posts.filter((post) => {
            const postDate = new Date(post.createdAt);
            return (
                postDate >= periodData.startDate &&
                postDate <= periodData.endDate
            );
        });

        const filteredComments = comments.filter((comment) => {
            const commentDate = new Date(comment.createdAt);
            return (
                commentDate >= periodData.startDate &&
                commentDate <= periodData.endDate
            );
        });

        return { posts: filteredPosts, comments: filteredComments };
    };

    const currentData = getFilteredData(selectedPeriod);

    // Calculate user statistics
    const getUserStats = useMemo(() => {
        const userMap = new Map();

        // Process posts
        currentData.posts.forEach((post) => {
            if (!userMap.has(post.username)) {
                userMap.set(post.username, {
                    username: post.username,
                    fbPosts: 0,
                    redditPosts: 0,
                    fbComments: 0,
                    redditComments: 0,
                    totalActivities: 0,
                });
            }

            const userStats = userMap.get(post.username);
            if (post.platform === "facebook") {
                userStats.fbPosts++;
            } else {
                userStats.redditPosts++;
            }
            userStats.totalActivities++;
        });

        // Process comments
        currentData.comments.forEach((comment) => {
            if (!userMap.has(comment.username)) {
                userMap.set(comment.username, {
                    username: comment.username,
                    fbPosts: 0,
                    redditPosts: 0,
                    fbComments: 0,
                    redditComments: 0,
                    totalActivities: 0,
                });
            }

            const userStats = userMap.get(comment.username);
            if (comment.platform === "facebook") {
                userStats.fbComments++;
            } else {
                userStats.redditComments++;
            }
            userStats.totalActivities++;
        });

        return Array.from(userMap.values()).sort(
            (a, b) => b.totalActivities - a.totalActivities,
        );
    }, [currentData]);

    // Calculate totals
    const totals = useMemo(() => {
        const fbPosts = currentData.posts.filter(
            (p) => p.platform === "facebook",
        ).length;
        const redditPosts = currentData.posts.filter(
            (p) => p.platform === "reddit",
        ).length;
        const fbComments = currentData.comments.filter(
            (c) => c.platform === "facebook",
        ).length;
        const redditComments = currentData.comments.filter(
            (c) => c.platform === "reddit",
        ).length;

        return {
            fbPosts,
            redditPosts,
            fbComments,
            redditComments,
            totalUsers: getUserStats.length,
            totalActivities:
                currentData.posts.length + currentData.comments.length,
        };
    }, [currentData, getUserStats]);

    const handleExport = () => {
        // Create workbook
        const wb = XLSX.utils.book_new();

        // Create worksheet data array
        const worksheetData = [];

        // Add header with cycle date
        worksheetData.push([`PAYMENT & WORK SUMMARY`]);
        worksheetData.push([`Cycle: ${periodInfo.name}`]);
        worksheetData.push([`Date Range: ${periodInfo.shortName}`]);
        worksheetData.push([]); // Empty row for spacing

        // Add summary section
        worksheetData.push(["SUMMARY"]);
        worksheetData.push(["Total Posts", currentData.posts.length]);
        worksheetData.push(["Total Comments", currentData.comments.length]);
        worksheetData.push(["Total Users", totals.totalUsers]);
        worksheetData.push(["Total Activities", totals.totalActivities]);
        worksheetData.push([]); // Empty row for spacing

        // Add platform breakdown
        worksheetData.push(["PLATFORM BREAKDOWN"]);
        worksheetData.push(["Facebook Posts", totals.fbPosts]);
        worksheetData.push(["Reddit Posts", totals.redditPosts]);
        worksheetData.push(["Facebook Comments", totals.fbComments]);
        worksheetData.push(["Reddit Comments", totals.redditComments]);
        worksheetData.push([]); // Empty row for spacing

        // Add user data headers
        worksheetData.push(["USER ACTIVITY DETAILS"]);
        worksheetData.push([
            "Username",
            "FB Posts",
            "RD Posts",
            "FB Comments",
            "RD Comments",
            "Total",
            "Payment Status",
        ]);

        // Add user data
        getUserStats.forEach((user) => {
            worksheetData.push([
                user.username,
                user.fbPosts,
                user.redditPosts,
                user.fbComments,
                user.redditComments,
                user.totalActivities,
                periodInfo.status === "completed" ? "Success" : "Pending",
            ]);
        });

        // Add empty row before total
        worksheetData.push([]);

        // Add total row
        worksheetData.push([
            "TOTAL",
            totals.fbPosts,
            totals.redditPosts,
            totals.fbComments,
            totals.redditComments,
            totals.totalActivities,
            periodInfo.status === "completed" ? "Success" : "Pending",
        ]);

        // Add footer with export date
        worksheetData.push([]);
        worksheetData.push([`Exported on: ${new Date().toLocaleString()}`]);
        worksheetData.push([
            `Payment Status: ${periodInfo.status === "completed" ? "Completed (Success)" : "Current Cycle (Pending)"}`,
        ]);

        // Convert to worksheet
        const ws = XLSX.utils.aoa_to_sheet(worksheetData);

        // Set column widths
        ws["!cols"] = [
            { wch: 20 }, // Username
            { wch: 12 }, // FB Posts
            { wch: 12 }, // RD Posts
            { wch: 14 }, // FB Comments
            { wch: 14 }, // RD Comments
            { wch: 12 }, // Total
            { wch: 15 }, // Payment Status
        ];

        // Add worksheet to workbook
        XLSX.utils.book_append_sheet(wb, ws, `${periodInfo.shortName}_Report`);

        // Save file with cycle date in filename
        const today = new Date();
        const year = today.getFullYear();
        const month = String(today.getMonth() + 1).padStart(2, "0");
        const day = String(today.getDate()).padStart(2, "0");
        const dateStr = `${year}-${month}-${day}`;
        const fileName = `Payment_Summary_${periodInfo.shortName.replace(/ /g, "_")}_${dateStr}.xlsx`;
        XLSX.writeFile(wb, fileName);
    };

    const scrollPeriods = (direction) => {
        const container = document.querySelector(".periods-scroll-container");
        if (container) {
            const scrollAmount = direction === "left" ? -200 : 200;
            container.scrollBy({ left: scrollAmount, behavior: "smooth" });
        }
    };

    return (
        <div className="payments-container">
            {/* Simple Navbar - Only Arrow */}
            <div className="payments-navbar">
                <Link to="/dashboard" className="nav-back-button">
                    <ArrowLeft size={24} />
                </Link>

                <h2 className="nav-title">Payment & Work Summary</h2>

                <div className="nav-placeholder"></div>
            </div>

            {/* Period Selection */}
            <div className="period-selection-container">
                <div className="period-nav">
                    <button
                        className="scroll-button"
                        onClick={() => scrollPeriods("left")}
                    >
                        &lt;
                    </button>

                    <div className="periods-scroll-container">
                        <button
                            className={`period-button ${selectedPeriod === "previous" ? "active" : ""}`}
                            onClick={() => setSelectedPeriod("previous")}
                        >
                            <Calendar size={12} />
                            <span>{periods.previous.name}</span>
                        </button>

                        <button
                            className={`period-button ${selectedPeriod === "current" ? "active" : ""}`}
                            onClick={() => setSelectedPeriod("current")}
                        >
                            <Calendar size={12} />
                            <span>{periods.current.name}</span>
                            {selectedPeriod === "current" && (
                                <span className="current-indicator">
                                    (Current)
                                </span>
                            )}
                        </button>
                    </div>

                    <button
                        className="scroll-button"
                        onClick={() => scrollPeriods("right")}
                    >
                        &gt;
                    </button>
                </div>
            </div>

            {/* TOTALS Card - Full Width with Cycle Date */}
            <div className="totals-card">
                <div className="cycle-date">
                    <Calendar size={14} />
                    <span>{periodInfo.shortName}</span>
                </div>
                <h3>TOTALS</h3>
                <div className="totals-container">
                    <div className="total-item">
                        <span className="total-label">Posts</span>
                        <span className="total-value">
                            {currentData.posts.length}
                        </span>
                    </div>
                    <div className="total-item">
                        <span className="total-label">Comments</span>
                        <span className="total-value">
                            {currentData.comments.length}
                        </span>
                    </div>
                </div>
            </div>

            {/* 4 Boxes Grid */}
            <div className="summary-grid">
                <div className="summary-card card-facebook">
                    <h3>FB POSTS</h3>
                    <p>{totals.fbPosts}</p>
                </div>

                <div className="summary-card card-reddit">
                    <h3>RD POSTS</h3>
                    <p>{totals.redditPosts}</p>
                </div>

                <div className="summary-card card-facebook">
                    <h3>FB COMMENTS</h3>
                    <p>{totals.fbComments}</p>
                </div>

                <div className="summary-card card-reddit">
                    <h3>RD COMMENTS</h3>
                    <p>{totals.redditComments}</p>
                </div>
            </div>

            {/* User Data Table */}
            <div className="table-container">
                <div className="table-header">
                    <h3 className="table-title">
                        <User size={14} />
                        User Activity Summary
                        {periodInfo.status === "current" && (
                            <span className="current-cycle-badge">
                                Current Cycle
                            </span>
                        )}
                    </h3>

                    <button className="export-button" onClick={handleExport}>
                        <Download size={16} />
                        <span className="export-text">Export Data</span>
                    </button>
                </div>

                <div className="responsive-table">
                    <table className="data-table">
                        <thead>
                            <tr>
                                <th>User</th>
                                <th>FB-P</th>
                                <th>RD-P</th>
                                <th>FB-C</th>
                                <th>RD-C</th>
                                <th>Total</th>
                                <th>Payment</th>
                            </tr>
                        </thead>
                        <tbody>
                            {getUserStats.map((user, index) => (
                                <tr key={index}>
                                    <td className="user-cell">
                                        <User size={10} />
                                        <span>{user.username}</span>
                                    </td>
                                    <td>{user.fbPosts}</td>
                                    <td>{user.redditPosts}</td>
                                    <td>{user.fbComments}</td>
                                    <td>{user.redditComments}</td>
                                    <td className="bold">
                                        {user.totalActivities}
                                    </td>
                                    <td>
                                        <span
                                            className={`payment-badge ${periodInfo.status === "completed" ? "success" : "pending"}`}
                                        >
                                            {periodInfo.status === "completed"
                                                ? "Success"
                                                : "Pending"}
                                        </span>
                                    </td>
                                </tr>
                            ))}

                            {/* Total Row */}
                            <tr className="total-row">
                                <td className="bold">Total</td>
                                <td className="bold">{totals.fbPosts}</td>
                                <td className="bold">{totals.redditPosts}</td>
                                <td className="bold">{totals.fbComments}</td>
                                <td className="bold">
                                    {totals.redditComments}
                                </td>
                                <td className="bold">
                                    {totals.totalActivities}
                                </td>
                                <td className="center">
                                    <span
                                        className={`payment-badge ${periodInfo.status === "completed" ? "success" : "pending"}`}
                                    >
                                        {periodInfo.status === "completed"
                                            ? "Success"
                                            : "Pending"}
                                    </span>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default Payments;
