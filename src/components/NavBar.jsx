// components/NavBar.jsx
import React from "react";
import { User, Filter } from "lucide-react";
import "./NavBar.css";

const NavBar = ({
    
    onFilterClick,
    hasActiveFilters,
    onMenuClick,
}) => {
    return (
        <nav className="navbar">
            <div className="nav-left">
                <h2 className="logo">TrackerDB</h2>
            </div>
            <div className="nav-right">
                
                <button className="filter-nav-btn" onClick={onFilterClick}>
                    <Filter size={18} />
                    {hasActiveFilters && (
                        <span className="filter-active-dot"></span>
                    )}
                </button>
                <div className="menu-wrapper mobile-only">
                    <button className="arrow-trigger-btn" onClick={onMenuClick}>
                        <User size={24} />
                    </button>
                </div>
            </div>
        </nav>
    );
};

export default NavBar;
