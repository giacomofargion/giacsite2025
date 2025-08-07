"use client";

import clsx from "clsx";
import React, { useState } from "react";
import { Content, KeyTextField, asLink } from "@prismicio/client";
import { PrismicNextLink } from "@prismicio/next";
import Link from "next/link";
import { MdMenu, MdClose } from "react-icons/md";
import { usePathname } from "next/navigation";

export default function NavBar({
  settings,
}: {
  settings: Content.SettingsDocument;
}) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  return (
    <nav aria-label="Main navigation" className="relative z-50">
      <div className="backdrop-blur-sm bg-slate-900/30 border-b border-slate-800/20 md:rounded-xl md:mx-4 md:mt-4 md:border md:border-slate-800/20">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <NameLogo name={settings.data.name} />

            {/* Desktop Menu */}
            <DesktopMenu settings={settings} pathname={pathname} />

            {/* Mobile Menu Button */}
            <button
              aria-expanded={open}
              aria-label="Open menu"
              className="block p-2 text-2xl text-slate-200 hover:text-white transition-colors md:hidden"
              onClick={() => setOpen(true)}
            >
              <MdMenu />
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Overlay */}
      <div
        className={clsx(
          "fixed inset-0 z-50 bg-slate-900/90 backdrop-blur-md transition-all duration-300 ease-in-out md:hidden",
          open ? "opacity-100 visible" : "opacity-0 invisible"
        )}
      >
        <div className="flex flex-col h-full">
          <div className="flex items-center justify-between p-6 border-b border-slate-800/30">
            <NameLogo name={settings.data.name} />
            <button
              aria-label="Close menu"
              className="p-2 text-2xl text-slate-200 hover:text-white transition-colors"
              onClick={() => setOpen(false)}
            >
              <MdClose />
            </button>
          </div>

          <div className="flex-1 flex flex-col justify-center items-center space-y-8">
            {settings.data.nav_item.map(({ link, label }, index) => (
              <React.Fragment key={label}>
                <li className="list-none">
                  <PrismicNextLink
                    className={clsx(
                      "group relative block text-4xl font-bold text-slate-200 hover:text-white transition-all duration-300",
                      pathname.includes(asLink(link) as string) && "text-white"
                    )}
                    field={link}
                    onClick={() => setOpen(false)}
                    aria-current={
                      pathname.includes(asLink(link) as string)
                        ? "page"
                        : undefined
                    }
                  >
                    <span className="relative">
                      {label}
                      <span className="absolute -bottom-2 left-0 w-0 h-0.5 bg-gradient-to-r from-red-500 to-slate-500 transition-all duration-300 group-hover:w-full"></span>
                    </span>
                  </PrismicNextLink>
                </li>
                {index < settings.data.nav_item.length - 1 && (
                  <div className="w-8 h-px bg-gradient-to-r from-transparent via-slate-700 to-transparent"></div>
                )}
              </React.Fragment>
            ))}
          </div>
        </div>
      </div>
    </nav>
  );
}

function NameLogo({ name }: { name: KeyTextField }) {
  return (
    <Link
      href="/"
      aria-label="Home page"
      className="text-xl font-extrabold tracking-tighter text-slate-100 hover:text-red-400 transition-colors duration-300"
    >
      {name}
    </Link>
  );
}

function DesktopMenu({
  settings,
  pathname,
}: {
  settings: Content.SettingsDocument;
  pathname: string;
}) {
  return (
    <div className="hidden md:flex items-center space-x-8">
      {settings.data.nav_item.map(({ link, label }, index) => (
        <React.Fragment key={label}>
          <li className="list-none">
            <PrismicNextLink
              className={clsx(
                "group relative block text-base font-medium text-slate-200 hover:text-white transition-all duration-300",
                pathname.includes(asLink(link) as string) && "text-white"
              )}
              field={link}
              aria-current={
                pathname.includes(asLink(link) as string) ? "page" : undefined
              }
            >
              <span className="relative">
                {label}
                <span className={clsx(
                  "absolute -bottom-1 left-0 h-0.5 bg-gradient-to-r from-red-500 to-slate-500 transition-all duration-300",
                  pathname.includes(asLink(link) as string)
                    ? "w-full"
                    : "w-0 group-hover:w-full"
                )}></span>
              </span>
            </PrismicNextLink>
          </li>
          {index < settings.data.nav_item.length - 1 && (
            <span
              className="text-slate-600 font-light"
              aria-hidden="true"
            >
              /
            </span>
          )}
        </React.Fragment>
      ))}
    </div>
  );
}
