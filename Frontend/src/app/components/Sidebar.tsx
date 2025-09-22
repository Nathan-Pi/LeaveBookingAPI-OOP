"use client";

import React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  CSidebar,
  CSidebarHeader,
  CSidebarNav,
  CSidebarToggler,
  CNavItem,
  CNavTitle,
} from "@coreui/react";
import CIcon from "@coreui/icons-react";
import {
  cilSpeedometer,
  cilList,
  cilUser,
  cilGroup,
  cilChart,
  cilPuzzle,
  cilX,
} from "@coreui/icons";
import { useUser } from "../contexts/UserContext";
import Cookies from "js-cookie";

const navConfig = [
  {
    label: "Dashboard",
    icon: cilSpeedometer,
    href: "/dashboard",
    roles: ["User", "Manager", "Admin"],
  },
  {
    label: "My Leave Requests",
    icon: cilList,
    href: "/leave/my-requests",
    roles: ["User", "Manager", "Admin"],
  },
  {
    label: "Request Leave",
    icon: cilPuzzle,
    href: "/leave/request",
    roles: ["User", "Manager", "Admin"],
  },
  {
    label: "Leave Summary",
    icon: cilChart,
    href: "/leave/summary",
    roles: ["User", "Manager", "Admin"],
  },
  {
    label: "Team Leave Requests",
    icon: cilGroup,
    href: "/team/requests",
    roles: ["Manager"],
  },
  {
    label: "Team Overview",
    icon: cilList,
    href: "/team/overview",
    roles: ["Manager"],
  },
  {
    label: "Staff Management",
    icon: cilUser,
    href: "/admin/staff",
    roles: ["Admin"],
  },
  {
    label: "Leave Requests Overview",
    icon: cilList,
    href: "/admin/requests",
    roles: ["Admin"],
  }
];

function getUserRoles(user) {
  if (!user) return [];
  if (Array.isArray(user.roles)) {
    return user.roles.map((r) => r.name);
  } else if (user.role && user.role.name) {
    return [user.role.name];
  }
  return [];
}

export const Sidebar = ({ visible = true, onClose, mobile = false } : { visible?: boolean, onClose?: () => void, mobile?: boolean }) => {
  const { user } = useUser();
  const router = useRouter();
  const userRoles = getUserRoles(user);

  const visibleItems = navConfig.filter((item) =>
    item.roles.some((role) => userRoles.includes(role))
  );

  const displayName =
    user?.firstname && user?.surname
      ? `${user.firstname} ${user.surname}`
      : user?.name || user?.email || "User";

  const handleLogout = () => {
    Cookies.remove("user");
    Cookies.remove("token");
    router.replace("/login");
  };

  return (
    <CSidebar
      className="custom-sidebar"
      style={{
        background: "#AEC6CF",
        zIndex: mobile ? 2000 : 100,
        position: mobile ? "fixed" : "fixed",
        left: 0,
        top: 0,
        height: "100vh",
        width: 250,
        transition: "transform 0.2s",
        transform: mobile
          ? visible
            ? "translateX(0)"
            : "translateX(-100%)"
          : "none",
        boxShadow: mobile && visible ? "2px 0 12px rgba(0,0,0,0.12)" : undefined,
      }}
      visible={visible}
      onVisibleChange={(v: boolean) => {
        if (!v && onClose) onClose();
      }}
    >
      <CSidebarHeader className="border-bottom d-flex justify-content-between align-items-center" style={{padding: "0.75rem 1rem"}}>
        <div style={{display: "flex", alignItems: "center", width: "100%", justifyContent: "space-between"}}>
          <span style={{fontWeight: 500, fontSize: "1rem"}}>
            Hi, {displayName}
          </span>
          <button
            onClick={handleLogout}
            style={{
              marginLeft: 12,
              padding: "3px 12px",
              background: "#fff",
              border: "1px solid #aaa",
              borderRadius: 6,
              cursor: "pointer",
              fontSize: "0.95rem",
              fontWeight: 500,
            }}
            aria-label="Logout"
          >
            Logout
          </button>
        </div>
        {mobile && (
          <button
            className="sidebar-close"
            style={{
              marginLeft: 16,
              background: "none",
              border: "none",
              fontSize: "1.8rem",
              cursor: "pointer",
              color: "#333",
              display: "inline-flex",
              alignItems: "center"
            }}
            aria-label="Close sidebar"
            onClick={onClose}
          >
            <CIcon icon={cilX} />
          </button>
        )}
      </CSidebarHeader>
      <CSidebarNav>
        <CNavTitle>Navigation</CNavTitle>
        {visibleItems.map((item) => (
          <CNavItem key={item.label} style={{ padding: 0 }}>
            <Link
              href={item.href}
              style={{
                display: "flex",
                alignItems: "center",
                textDecoration: "none",
                color: "inherit",
                padding: "0.5rem 1rem",
                width: "100%",
              }}
              className="nav-link"
              onClick={mobile && onClose ? onClose : undefined}
            >
              <CIcon customClassName="nav-icon" icon={item.icon} />
              <span style={{ marginLeft: 8 }}>{item.label}</span>
            </Link>
          </CNavItem>
        ))}
      </CSidebarNav>
      <CSidebarHeader className="border-top">
        <CSidebarToggler />
      </CSidebarHeader>
    </CSidebar>
  );
};