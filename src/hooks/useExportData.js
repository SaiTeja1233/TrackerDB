// src/hooks/useExportData.js
import * as XLSX from "xlsx";

export const useExportData = () => {
    const exportToExcel = (posts, comments) => {
        try {
            // Create workbook
            const wb = XLSX.utils.book_new();

            // ==================== SHEET 1: USER SUMMARY ====================
            const excelData = [];

            // Get all unique usernames
            const allItems = [...posts, ...comments];
            const uniqueUsers = [
                ...new Set(
                    allItems.map((item) => item.username).filter(Boolean),
                ),
            ];

            uniqueUsers.forEach((username) => {
                const userPosts = posts.filter(
                    (post) => post.username === username,
                );
                const userComments = comments.filter(
                    (comment) => comment.username === username,
                );
                const userRedditPosts = userPosts.filter(
                    (post) => (post.platform || "reddit") === "reddit",
                );
                const userFacebookPosts = userPosts.filter(
                    (post) => post.platform === "facebook",
                );
                const userRedditComments = userComments.filter(
                    (comment) => (comment.platform || "reddit") === "reddit",
                );
                const userFacebookComments = userComments.filter(
                    (comment) => comment.platform === "facebook",
                );

                excelData.push({
                    Username: username,
                    "Total Posts": userPosts.length,
                    "Total Comments": userComments.length,
                    "Total Activities": userPosts.length + userComments.length,
                    "Reddit Posts": userRedditPosts.length,
                    "Reddit Comments": userRedditComments.length,
                    "Reddit Total":
                        userRedditPosts.length + userRedditComments.length,
                    "Facebook Posts": userFacebookPosts.length,
                    "Facebook Comments": userFacebookComments.length,
                    "Facebook Total":
                        userFacebookPosts.length + userFacebookComments.length,
                });
            });

            // Sort by total activities
            excelData.sort(
                (a, b) => b["Total Activities"] - a["Total Activities"],
            );

            // Add summary row
            const totalPosts = posts.length;
            const totalComments = comments.length;
            const totalRedditPosts = posts.filter(
                (p) => (p.platform || "reddit") === "reddit",
            ).length;
            const totalRedditComments = comments.filter(
                (c) => (c.platform || "reddit") === "reddit",
            ).length;
            const totalFacebookPosts = posts.filter(
                (p) => p.platform === "facebook",
            ).length;
            const totalFacebookComments = comments.filter(
                (c) => c.platform === "facebook",
            ).length;

            const summaryRow = {
                Username: "TOTAL SUMMARY",
                "Total Posts": totalPosts,
                "Total Comments": totalComments,
                "Total Activities": totalPosts + totalComments,
                "Reddit Posts": totalRedditPosts,
                "Reddit Comments": totalRedditComments,
                "Reddit Total": totalRedditPosts + totalRedditComments,
                "Facebook Posts": totalFacebookPosts,
                "Facebook Comments": totalFacebookComments,
                "Facebook Total": totalFacebookPosts + totalFacebookComments,
            };

            excelData.push({}); // Empty row for separation
            excelData.push(summaryRow);

            // Create worksheet for user summary
            const wsSummary = XLSX.utils.json_to_sheet(excelData);

            // Add filter ONLY to Username column (Column A)
            if (excelData.length > 0 && wsSummary["!ref"]) {
                const range = XLSX.utils.decode_range(wsSummary["!ref"]);
                wsSummary["!autofilter"] = {
                    ref: XLSX.utils.encode_range({
                        s: { r: range.s.r, c: 0 },
                        e: { r: range.e.r, c: 0 },
                    }),
                };
            }

            // Set column widths
            wsSummary["!cols"] = [
                { wch: 20 }, // Username
                { wch: 12 }, // Total Posts
                { wch: 15 }, // Total Comments
                { wch: 15 }, // Total Activities
                { wch: 12 }, // Reddit Posts
                { wch: 15 }, // Reddit Comments
                { wch: 12 }, // Reddit Total
                { wch: 15 }, // Facebook Posts
                { wch: 18 }, // Facebook Comments
                { wch: 15 }, // Facebook Total
            ];

            // Style the header row
            if (wsSummary["!ref"]) {
                const headerRange = XLSX.utils.decode_range(wsSummary["!ref"]);
                for (let C = headerRange.s.c; C <= headerRange.e.c; ++C) {
                    const cellAddress = XLSX.utils.encode_cell({
                        r: headerRange.s.r,
                        c: C,
                    });
                    if (!wsSummary[cellAddress]) continue;
                    wsSummary[cellAddress].s = {
                        font: { bold: true, sz: 12 },
                        fill: { fgColor: { rgb: "E8F4FD" } },
                        alignment: { horizontal: "center" },
                    };
                }
            }

            XLSX.utils.book_append_sheet(wb, wsSummary, "User Summary");

            // ==================== SHEET 2: PLATFORM DATA ====================
            const platformData = [];

            const allUsers = [
                ...new Set(
                    [...posts, ...comments]
                        .map((item) => item.username)
                        .filter(Boolean),
                ),
            ];

            allUsers.forEach((username) => {
                const userPosts = posts.filter((p) => p.username === username);
                const userComments = comments.filter(
                    (c) => c.username === username,
                );

                const redditPosts = userPosts.filter(
                    (p) => (p.platform || "reddit") === "reddit",
                ).length;
                const redditComments = userComments.filter(
                    (c) => (c.platform || "reddit") === "reddit",
                ).length;
                const facebookPosts = userPosts.filter(
                    (p) => p.platform === "facebook",
                ).length;
                const facebookComments = userComments.filter(
                    (c) => c.platform === "facebook",
                ).length;

                platformData.push({
                    User: username,
                    Platform: "Reddit",
                    Posts: redditPosts,
                    Comments: redditComments,
                    Total: redditPosts + redditComments,
                });

                platformData.push({
                    User: username,
                    Platform: "Facebook",
                    Posts: facebookPosts,
                    Comments: facebookComments,
                    Total: facebookPosts + facebookComments,
                });
            });

            // Add summary rows
            platformData.push({});
            platformData.push({
                User: "TOTAL",
                Platform: "Reddit",
                Posts: totalRedditPosts,
                Comments: totalRedditComments,
                Total: totalRedditPosts + totalRedditComments,
            });
            platformData.push({
                User: "TOTAL",
                Platform: "Facebook",
                Posts: totalFacebookPosts,
                Comments: totalFacebookComments,
                Total: totalFacebookPosts + totalFacebookComments,
            });

            const wsPlatform = XLSX.utils.json_to_sheet(platformData);

            if (platformData.length > 0 && wsPlatform["!ref"]) {
                const platformRange = XLSX.utils.decode_range(
                    wsPlatform["!ref"],
                );
                wsPlatform["!autofilter"] = {
                    ref: XLSX.utils.encode_range({
                        s: { r: platformRange.s.r, c: 0 },
                        e: { r: platformRange.e.r, c: 1 },
                    }),
                };
            }

            wsPlatform["!cols"] = [
                { wch: 20 }, // User
                { wch: 12 }, // Platform
                { wch: 10 }, // Posts
                { wch: 12 }, // Comments
                { wch: 10 }, // Total
            ];

            // Style header for platform sheet
            if (wsPlatform["!ref"]) {
                const platformHeaderRange = XLSX.utils.decode_range(
                    wsPlatform["!ref"],
                );
                for (
                    let C = platformHeaderRange.s.c;
                    C <= platformHeaderRange.e.c;
                    ++C
                ) {
                    const cellAddress = XLSX.utils.encode_cell({
                        r: platformHeaderRange.s.r,
                        c: C,
                    });
                    if (!wsPlatform[cellAddress]) continue;
                    wsPlatform[cellAddress].s = {
                        font: { bold: true, sz: 12 },
                        fill: { fgColor: { rgb: "E8F4FD" } },
                        alignment: { horizontal: "center" },
                    };
                }
            }

            XLSX.utils.book_append_sheet(wb, wsPlatform, "Platform Data");

            // Generate filename
            const fileName = `tracker_export_${new Date()
                .toISOString()
                .slice(0, 19)
                .replace(/:/g, "-")}.xlsx`;

            // Save file
            XLSX.writeFile(wb, fileName);

            return {
                success: true,
                message: `Data exported successfully!\n\nSheets included:\n- User Summary\n- Platform Data\n\nTotal Users: ${uniqueUsers.length}\nTotal Posts: ${totalPosts}\nTotal Comments: ${totalComments}`,
            };
        } catch (err) {
            console.error("Error exporting data:", err);
            return { success: false, message: err.message };
        }
    };

    return { exportToExcel };
};
