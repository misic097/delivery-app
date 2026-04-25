import React from "react";
import { LogOut } from "lucide-react";

export default function Navbar({ pages, activePage, onNavigate, onLogout }) {
  return (
    <aside className="navbar">
      <div className="brand">
        <div className="brand-mark">D</div>
        <div>
          <span>Delivery App</span>
          <small>Route desk</small>
        </div>
      </div>

      <nav className="nav-links" aria-label="Main navigation">
        {pages.map((page) => {
          const Icon = page.icon;

          return (
            <button
              key={page.id}
              className={activePage === page.id ? "nav-link active" : "nav-link"}
              type="button"
              onClick={() => onNavigate(page.id)}
            >
              <Icon size={18} />
              <span>{page.label}</span>
            </button>
          );
        })}
      </nav>

      <button className="logout-button" type="button" onClick={onLogout}>
        <LogOut size={17} />
        Logout
      </button>
    </aside>
  );
}