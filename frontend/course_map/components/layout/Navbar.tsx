"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Bell, HelpCircle, UserCircle, Search } from "lucide-react";
import { cn } from "@/lib/utils";

const navLinks = [
  { label: "Map Dashboard", href: "/map" },
  { label: "Event Explorer", href: "/events" },
  { label: "Routing & Nav", href: "/mapRouting" },
  { label: "My Schedule", href: "/eventSchedule" },
];

export function Navbar() {
  const pathname = usePathname();

  return (
    <header
      className="fixed top-0 right-0 left-0 lg:left-sidebar-width z-50 flex items-center justify-between h-navbar-height px-6 bg-white/80 backdrop-blur-md border-b border-slate-200 shadow-sm"
      role="banner"
    >
      {/* Logo (visible only on mobile since sidebar is hidden) */}
      <div className="flex items-center gap-6">
        <span className="text-xl font-black text-slate-900 tracking-tight lg:hidden">
          CampusNav
        </span>

        {/* Search bar (desktop) */}
        <div className="hidden md:flex relative items-center max-w-sm w-full">
          <Search
            className="absolute left-3 text-on-surface-variant w-4 h-4"
            aria-hidden="true"
          />
          <input
            type="search"
            placeholder="Search buildings, events..."
            aria-label="Search campus"
            className="w-full bg-surface-container-low border-none rounded-lg py-2 pl-9 pr-4 text-body-sm focus:ring-2 focus:ring-secondary/20 focus:outline-none placeholder:text-on-surface-variant"
          />
        </div>

        {/* Desktop nav links (for non-sidebar pages) */}
        <nav
          className="hidden md:flex gap-6 lg:hidden items-center"
          aria-label="Main navigation"
        >
          {navLinks.map(({ label, href }) => {
            const isActive = pathname === href || pathname.startsWith(href + "/");
            return (
              <Link
                key={href}
                href={href}
                aria-current={isActive ? "page" : undefined}
                className={cn(
                  "text-body-sm font-medium tracking-tight transition-colors h-navbar-height flex items-center border-b-2",
                  isActive
                    ? "text-secondary border-secondary font-bold"
                    : "text-on-surface-variant border-transparent hover:text-secondary",
                )}
              >
                {label}
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Right actions */}
      <div className="flex items-center gap-1">
        <button
          aria-label="Notifications"
          className="p-2 rounded-full hover:bg-surface-container transition-colors active:scale-95"
        >
          <Bell className="w-5 h-5 text-on-surface-variant" aria-hidden="true" />
        </button>
        <button
          aria-label="Help"
          className="p-2 rounded-full hover:bg-surface-container transition-colors active:scale-95"
        >
          <HelpCircle className="w-5 h-5 text-on-surface-variant" aria-hidden="true" />
        </button>
        <button
          aria-label="Account"
          className="p-1 rounded-full hover:bg-surface-container transition-colors active:scale-95"
        >
          <UserCircle className="w-7 h-7 text-on-surface-variant" aria-hidden="true" />
        </button>
      </div>
    </header>
  );
}
