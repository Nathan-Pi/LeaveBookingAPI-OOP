"use client";

import "bootstrap/dist/css/bootstrap.min.css";
import "@coreui/coreui/dist/css/coreui.min.css";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { UserProvider } from "./contexts/UserContext";
import { usePathname } from "next/navigation";
import { Sidebar } from './components/Sidebar';
import React, { useState, useEffect } from "react";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const pathname = usePathname();
  const hideSidebar = pathname === "/login";
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    setSidebarOpen(false);
  }, [pathname]);

  const [isMobile, setIsMobile] = useState(false);
  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth <= 900);
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable}`}>
        <UserProvider>
          {!hideSidebar && isMobile && (
            <>
              <button
                className="sidebar-hamburger"
                aria-label="Open sidebar"
                onClick={() => setSidebarOpen(true)}
              >
                &#9776;
              </button>
              <Sidebar
                visible={sidebarOpen}
                onClose={() => setSidebarOpen(false)}
                mobile={true}
              />
              {sidebarOpen && (
                <div
                  className="sidebar-backdrop"
                  onClick={() => setSidebarOpen(false)}
                />
              )}
            </>
          )}
          {!hideSidebar && !isMobile && (
            <Sidebar visible={true} mobile={false} />
          )}
          <div className={`main-content${hideSidebar ? " full" : ""}`}>
            {children}
          </div>
        </UserProvider>
      </body>
    </html>
  );
}