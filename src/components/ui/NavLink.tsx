"use client";

import type { ReactNode } from "react";
import { Link, usePathname } from "@/i18n/navigation";

type NavLinkProps = {
  href: "/" | "/gravity" | "/three-body";
  children: ReactNode;
  className: string;
};

export const NavLink = ({ href, children, className }: NavLinkProps) => {
  const pathname = usePathname();

  const isCurrentPage = pathname === href;

  const isActive =
    isCurrentPage || (href !== "/" && pathname.startsWith(`${href}/`));

  return (
    <Link
      href={href}
      aria-current={isCurrentPage ? "page" : undefined}
      className={`
        ${className}
        transition-colors
        duration-200
        motion-reduce:transition-none
        ${isActive ? "text-[#F8BA00]" : "text-slate-300 hover:text-white"}
      `}
    >
      {children}
    </Link>
  );
};
