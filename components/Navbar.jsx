"use client";

import Link from "next/link";
import ThemeToggle from "./ThemeToggle";

export default function Navbar() {
  return (
    <header className="nav">
      <Link href="/" className="brand">
        PRICETER
      </Link>
      <nav>
        <Link href="/search">Search</Link>
        <Link href="/report">Report</Link>
        <ThemeToggle />
      </nav>
    </header>
  );
}
