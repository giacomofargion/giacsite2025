'use client'

import { ImageField } from '@prismicio/client';
import { PrismicNextImage } from "@prismicio/next"
import clsx from 'clsx';
import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';

type AvatarProps = {
  image: ImageField;
  className?: string;
}

export default function Avatar({ image, className }: AvatarProps) {
  const component = useRef(null);

  useEffect(() => {
    let ctx = gsap.context(() => {
      // Avatar animation
      gsap.fromTo(
        ".avatar",
        { opacity: 0, scale: 1.4 },
        { scale: 1, opacity: 1, duration: 1.3, ease: "power3.inOut" }
      );
    }, component);

    return () => {
      ctx.revert(); // Cleanup GSAP context
    };
  }, []); // Empty dependency array ensures it only runs once

  return (
    <div ref={component} className={clsx("relative h-full w-full", className)}>
      <div className="avatar aspect-[1/1] overflow-hidden rounded-2x1 opacity-0">
        <PrismicNextImage
          field={image}
          className="avatar-image w-full object-fill"
          imgixParams={{
            q: 90,
            w: 400, // Set width for optimization
            h: 400, // Maintain square aspect ratio
            fit: 'crop', // Crop to fit
          }}
        />
        <div className="highlight absolute inset-0 opacity-0 scale-110 md:block w-full bg-gradient-to-tr from-transparent via-white to-transparent" />
      </div>
    </div>
  );
}
