/* eslint-disable react/no-children-prop */
"use client";

import { JSX, useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Bounded from "@/app/components/Bounded";
import type { Content } from "@prismicio/client";
import { PrismicNextImage } from "@prismicio/next";
import {
  PrismicLink,
  PrismicRichText,
  type SliceComponentProps,
} from "@prismicio/react";
import Heading from "@/app/components/Heading";

export type GalleryProps = SliceComponentProps<Content.GallerySlice>;

gsap.registerPlugin(ScrollTrigger);

const Gallery = ({ slice }: GalleryProps): JSX.Element => {
  const galleryRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (galleryRef.current) {
      const items = galleryRef.current.children;

      gsap.set(items, { opacity: 0, x: (i) => (i % 2 === 0 ? -100 : 100) }); // Set initial state

      Array.from(items).forEach((item) => {
        gsap.to(item, {
          opacity: 1,
          x: 0,
          duration: 1,
          ease: "power2.out",
          scrollTrigger: {
            trigger: item,
            start: "top 85%", // Starts when 85% of item is visible
            toggleActions: "play none none none", // No reversing when scrolling up
          },
        });
      });
    }
  }, []);

  return (
    <Bounded>
      <Heading
        as="h1"
        size="xl"
        className="col-start-1 text-6xl font-extrabold tracking-tight text-white drop-shadow-lg"
      >
        {slice.primary.heading}
      </Heading>
      <div className="prose prose-xl prose-invert gap-4 col-start-1 mt-4 max-w-2xl leading-relaxed text-white/80">
        <PrismicRichText field={slice.primary.description} />
      </div>

      <div
        ref={galleryRef}
        className="grid grid-cols-1 gap-8 mt-8 md:grid-cols-2 lg:grid-cols-3"
      >
        {slice.primary.gallery.map((item, index) => (
          <div
            key={index}
            className="group flex flex-col overflow-hidden rounded-lg border shadow-md transition-shadow"
          >
            <PrismicLink field={item.link} className="block overflow-hidden">
              <div className="relative">
                <PrismicNextImage
                  field={item.image}
                  className="aspect-square w-full object-cover transition-transform duration-300 group-hover:scale-105 group-hover:brightness-75"
                  alt=""
                />
              </div>
            </PrismicLink>
            <div className="p-4">
              <h3 className="mb-2 text-xl font-semibold">{item.title}</h3>
              <p className="mb-2 text-gray-500">{item.artist_name}</p>
              <p className="text-sm text-gray-500">{item.date}</p>
            </div>
          </div>
        ))}
      </div>
    </Bounded>
  );
};

export default Gallery;
