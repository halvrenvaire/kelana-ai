"use client";

import { usePathname } from "next/navigation";
import { ReactNode } from "react";

export default function BodyWrapper({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const isLandingPage = pathname === "/";

  return (
    <div className={isLandingPage ? "" : "pt-16 md:pb-0 pb-[72px]"}>
      {children}
    </div>
  );
}
