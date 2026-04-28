"use client";

import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { useState } from "react";

const NAV_GROUPS = [
  {
    title: "Overview",
    items: [{ href: "/", label: "Dashboard", icon: "home" }],
  },
  {
    title: "Users",
    items: [
      { href: "/users", label: "All users", icon: "users" },
      { href: "/subscriptions", label: "Subscriptions", icon: "card" },
    ],
  },
  {
    title: "Content",
    items: [
      { href: "/affirmations", label: "Affirmations", icon: "sparkle" },
      { href: "/experiences", label: "Experiences", icon: "star" },
    ],
  },
  {
    title: "Engagement",
    items: [
      { href: "/activities", label: "Activity log", icon: "activity" },
      { href: "/announcements", label: "Announcements", icon: "megaphone" },
    ],
  },
  {
    title: "Account",
    items: [
      { href: "/profile", label: "My profile", icon: "user" },
    ],
  },
];

function Icon({ name }) {
  const common = {
    width: 18,
    height: 18,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 2,
    strokeLinecap: "round",
    strokeLinejoin: "round",
    "aria-hidden": true,
  };
  switch (name) {
    case "home":
      return (
        <svg {...common}>
          <path d="M3 10.5 12 3l9 7.5" />
          <path d="M5 9.5V21h14V9.5" />
        </svg>
      );
    case "users":
      return (
        <svg {...common}>
          <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
          <circle cx="9" cy="7" r="4" />
          <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
          <path d="M16 3.13a4 4 0 0 1 0 7.75" />
        </svg>
      );
    case "user":
      return (
        <svg {...common}>
          <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
          <circle cx="12" cy="7" r="4" />
        </svg>
      );
    case "card":
      return (
        <svg {...common}>
          <rect x="2" y="5" width="20" height="14" rx="2" />
          <line x1="2" y1="10" x2="22" y2="10" />
        </svg>
      );
    case "layers":
      return (
        <svg {...common}>
          <polygon points="12 2 2 7 12 12 22 7 12 2" />
          <polyline points="2 17 12 22 22 17" />
          <polyline points="2 12 12 17 22 12" />
        </svg>
      );
    case "sparkle":
      return (
        <svg {...common}>
          <path d="M12 3v3M12 18v3M3 12h3M18 12h3M5.6 5.6l2.1 2.1M16.3 16.3l2.1 2.1M5.6 18.4l2.1-2.1M16.3 7.7l2.1-2.1" />
          <circle cx="12" cy="12" r="3" />
        </svg>
      );
    case "star":
      return (
        <svg {...common}>
          <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
        </svg>
      );
    case "activity":
      return (
        <svg {...common}>
          <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
        </svg>
      );
    case "megaphone":
      return (
        <svg {...common}>
          <path d="M3 11v2a2 2 0 0 0 2 2h2l4 4V5L7 9H5a2 2 0 0 0-2 2z" />
          <path d="M14 7a5 5 0 0 1 0 10" />
        </svg>
      );
    case "cog":
      return (
        <svg {...common}>
          <circle cx="12" cy="12" r="3" />
          <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 1 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.6 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 1 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.6a1.65 1.65 0 0 0 1-1.51V3a2 2 0 1 1 4 0v.09A1.65 1.65 0 0 0 15 4.6a1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9c.2.36.31.77.31 1.19V10" />
        </svg>
      );
    default:
      return null;
  }
}

function initials(user) {
  if (!user) return "A";
  const src = user.name || user.email || "Admin";
  return src
    .split(/[\s@]+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase())
    .join("");
}

function findActiveLabel(pathname) {
  for (const group of NAV_GROUPS) {
    for (const item of group.items) {
      if (item.href === "/" && pathname === "/") return item.label;
      if (item.href !== "/" && pathname.startsWith(item.href)) return item.label;
    }
  }
  return "Dashboard";
}

export default function AdminShell({ user, children }) {
  const router = useRouter();
  const pathname = usePathname();
  const [loggingOut, setLoggingOut] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  async function handleLogout() {
    setLoggingOut(true);
    try {
      await fetch("/api/auth/logout", { method: "POST" });
    } finally {
      router.replace("/login");
      router.refresh();
    }
  }

  const title = findActiveLabel(pathname);

  return (
    <div className={`app-view ${sidebarOpen ? "sidebar-open" : ""}`}>
      {sidebarOpen ? (
        <div
          className="sidebar-backdrop"
          onClick={() => setSidebarOpen(false)}
          aria-hidden
        />
      ) : null}
      <aside className="sidebar" aria-label="Admin navigation">
        <div className="brand">
          <span className="brand-mark">MO</span>
          <span>Mind Over</span>
        </div>

        <nav className="nav">
          {NAV_GROUPS.map((group) => (
            <div className="nav-group" key={group.title}>
              <div className="nav-group-title">{group.title}</div>
              {group.items.map((item) => {
                const isActive =
                  item.href === "/"
                    ? pathname === "/"
                    : pathname.startsWith(item.href);
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={isActive ? "active" : ""}
                    onClick={() => setSidebarOpen(false)}
                  >
                    <Icon name={item.icon} />
                    <span>{item.label}</span>
                  </Link>
                );
              })}
            </div>
          ))}
        </nav>

        <div className="sidebar-user">
          <div className="avatar">{initials(user)}</div>
          <div className="sidebar-user-meta">
            <strong>{user?.name || user?.email || "Admin"}</strong>
            <small>{user?.role || user?.type || "admin"}</small>
          </div>
        </div>
      </aside>

      <section className="main">
        <header className="topbar">
          <div className="topbar-left">
            <button
              type="button"
              className="menu-toggle"
              onClick={() => setSidebarOpen((v) => !v)}
              aria-label="Toggle navigation"
            >
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <line x1="3" y1="6" x2="21" y2="6" />
                <line x1="3" y1="12" x2="21" y2="12" />
                <line x1="3" y1="18" x2="21" y2="18" />
              </svg>
            </button>
            <div>
              <h1>{title}</h1>
              <span>
                Welcome back, {user?.name || user?.email || "Admin"}
              </span>
            </div>
          </div>
          <button
            className="logout"
            onClick={handleLogout}
            type="button"
            disabled={loggingOut}
          >
            {loggingOut ? "Signing out…" : "Logout"}
          </button>
        </header>

        <div className="content">{children}</div>
      </section>
    </div>
  );
}
