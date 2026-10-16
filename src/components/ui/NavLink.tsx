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
  const isActive = isCurrentPage || (href !== "/" && pathname.startsWith(`${href}/`));

  return (
    <Link
      href={href}
      aria-current={isCurrentPage ? "page" : undefined}
      className={`${className} transition-[background-color,color,box-shadow] duration-200 motion-reduce:transition-none ${isActive ? "bg-white/15 text-cyan-100 ring-1 ring-inset ring-sky-200/40 hover:bg-white/20" : "text-slate-300 hover:bg-white/10 hover:text-white"}`}
    >
      {children}
    </Link>
  );
};
