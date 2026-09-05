"use client";

import { usePathname } from "next/navigation";
import Navbar from "./Navbar";

export default function ConditionalNavbar() {
  const pathname = usePathname();
  const isLandingPage = pathname === "/";

  // Jangan render navbar di landing page
  if (isLandingPage) {
    return null;
  }

  return <Navbar />;
}
