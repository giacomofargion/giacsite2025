'use client';

import { useRef, FC, useState } from "react";
import { Content, KeyTextField } from "@prismicio/client";
import { SliceComponentProps } from "@prismicio/react";
import { gsap } from "gsap";
import Bounded from "@/app/components/Bounded";
import dynamic from 'next/dynamic';
import LoadingScreen from "@/app/components/LoadingScreen";  // Import LoadingScreen

const MorphingCanvas = dynamic(() => import("@/slices/Hero/MorphingImage"), {
  ssr: false,
});

export type HeroProps = SliceComponentProps<Content.HeroSlice>;

const Hero: FC<HeroProps> = ({ slice }) => {
  const component = useRef(null);
  const [isLoading, setIsLoading] = useState(true);  // Track loading state
  const timelineRef = useRef(gsap.timeline());

  const handleModelLoaded = (model: { scale: gsap.TweenTarget }) => {
    const tl = timelineRef.current;
    tl.clear();

    // First hide the loading screen
    setIsLoading(false);

    // Then animate the model and text
    tl.to(model.scale, {
      x: 1,
      y: 1,
      z: 1,
      duration: 1,
      ease: "power3.out"
    })
    .fromTo(
      ".name-animation",
      {
        x: -100,
        opacity: 0,
        rotate: -10
      },
      {
        x: 0,
        opacity: 1,
        rotate: 0,
        ease: "elastic.out(1,0.3)",
        duration: 1,
        transformOrigin: "left top",
        stagger: {
          each: 0.1,
          from: "random"
        }
      },
      "-=0.5"
    );
  };

  const renderLetters = (name: KeyTextField, key: string) => {
    if (!name) return null;
    return name.split("").map((letter, index) => (
      <span
        key={`${key}-${index}`}
        className={`name-animation name-animation-${key}-index inline-block opacity-0`}
      >
        {letter}
      </span>
    ));
  };

  return (
    <Bounded
      data-slice-type={slice.slice_type}
      data-slice-variation={slice.variation}
      ref={component}
      className="relative"
    >
      {isLoading && <LoadingScreen />}  {/* Show LoadingScreen while loading */}

      <div className="grid min-h-[70vh] grid-cols-1 md:grid-cols-2 items-center gap-8">
        <div className="col-start-1 md:col-start-1 md:row-start-1">
          <h1
            className="mb-8 text-[clamp(3rem,18vmin,18rem)] font-extrabold leading-none tracking-tighter"
            aria-label={
              slice.primary.first_name + " " + slice.primary.last_name
            }
          >
            <span className="block text-red-500">
              {renderLetters(slice.primary.first_name, "first")}
            </span>
            <span className="-mt-[.2em] block text-slate-500">
              {renderLetters(slice.primary.last_name, "last")}
            </span>
          </h1>
        </div>

        <div className="col-start-1 md:col-start-2 md:row-start-1 flex justify-center">
          <MorphingCanvas onLoaded={handleModelLoaded} />
        </div>
      </div>
    </Bounded>
  );
};

export default Hero;
