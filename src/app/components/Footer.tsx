import clsx from "clsx";
import React from "react";
import { createClient } from "@/prismicio";
import { PrismicNextLink } from "@prismicio/next";
import Link from "next/link";
import Bounded from "./Bounded";
import { isFilled } from "@prismicio/client";
import { FaTwitter, FaBandcamp, FaInstagram, FaSpotify, FaYoutube } from "react-icons/fa6";

export default async function Footer() {
  const client = createClient();
  const settings = await client.getSingle("settings");
  return (
    <Bounded as="footer" className="text-slate-600">
      <div className="container mx-auto mt-20 flex flex-col items-center justify-between gap-6 py-8 sm:flex-row sm:flex-wrap sm:justify-between">
        <div className="name flex flex-col items-center justify-center gap-x-4 gap-y-2 sm:flex-row sm:justify-self-start sm:gap-8">
          <Link
            href="/"
            className="text-xl font-extrabold tracking-tighter text-slate-100 transition-colors duration-150 hover:text-yellow-400"
          >
            {settings.data.name}
          </Link>
          <span
            className="hidden text-5xl font-extralight leading-[0] text-slate-400 sm:inline"
            aria-hidden={true}
          >
            /
          </span>
          <p className="text-sm text-slate-300 ">
            © {new Date().getFullYear()} {settings.data.name}
          </p>
        </div>

        <nav className="navigation w-full sm:w-auto" aria-label="Footer Navigation">
          <ul className="flex items-center justify-center gap-1 flex-wrap sm:justify-start">
            {settings.data.nav_item.map(({ link, label }, index) => (
              <React.Fragment key={label}>
                <li>
                  <PrismicNextLink
                    className={clsx(
                      "group relative block overflow-hidden rounded px-3 py-1 text-base font-bold text-slate-100 transition-colors duration-150 hover:hover:text-yellow-400",
                    )}
                    field={link}
                  >
                    {label}
                  </PrismicNextLink>
                </li>
                {index < settings.data.nav_item.length - 1 && (
                  <span
                    className="text-4xl font-thin leading-[0] text-slate-400"
                    aria-hidden="true"
                  >
                    /
                  </span>
                )}
              </React.Fragment>
            ))}
          </ul>
        </nav>

        <div className="socials inline-flex justify-center sm:justify-end gap-4">
          {isFilled.link(settings.data.bandcamp_link) && (
            <PrismicNextLink
              field={settings.data.bandcamp_link}
              className="p-2 text-2xl text-slate-300 transition-all duration-150 hover:scale-125 hover:text-yellow-400"
              aria-label={settings.data.name + " on Bandcamp"}
            >
              <FaBandcamp />
            </PrismicNextLink>
          )}
          {isFilled.link(settings.data.twitter_link) && (
            <PrismicNextLink
              field={settings.data.twitter_link}
              className="p-2 text-2xl text-slate-300 transition-all duration-150 hover:scale-125 hover:text-yellow-400"
              aria-label={settings.data.name + " on Twitter"}
            >
              <FaTwitter />
            </PrismicNextLink>
          )}
           {isFilled.link(settings.data.instagram_link) && (
            <PrismicNextLink
              field={settings.data.instagram_link}
              className="p-2 text-2xl text-slate-300 transition-all duration-150 hover:scale-125 hover:text-yellow-400"
              aria-label={settings.data.name + " on Instagram"}
            >
              <FaInstagram />
            </PrismicNextLink>
          )}
          {isFilled.link(settings.data.spotify_link) && (
            <PrismicNextLink
              field={settings.data.spotify_link}
              className="p-2 text-2xl text-slate-300 transition-all duration-150 hover:scale-125 hover:text-yellow-400"
              aria-label={settings.data.name + " on Spotify"}
            >
              <FaSpotify />
            </PrismicNextLink>
          )}
          {isFilled.link(settings.data.youtube_link) && (
            <PrismicNextLink
              field={settings.data.youtube_link}
              className="p-2 text-2xl text-slate-300 transition-all duration-150 hover:scale-125 hover:text-yellow-400"
              aria-label={settings.data.name + " on Youtube"}
            >
              <FaYoutube />
            </PrismicNextLink>
          )}
        </div>
      </div>
    </Bounded>
  );
}
