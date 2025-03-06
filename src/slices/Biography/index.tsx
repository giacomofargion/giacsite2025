'use client'

import { FC, useEffect, useRef } from "react";
import { Content } from "@prismicio/client";
import { PrismicRichText, SliceComponentProps } from "@prismicio/react";
import { gsap } from "gsap";
import Bounded from "@/app/components/Bounded";
import Heading from "@/app/components/Heading";
import Avatar from "./Avatar";

/**
 * Props for `Biography`.
 */
export type BiographyProps = SliceComponentProps<Content.BiographySlice>;

/**
 * Component for "Biography" Slices.
 */
const Biography: FC<BiographyProps> = ({ slice }) => {
  const textRef = useRef(null); // Reference for the text elements
  const avatarRef = useRef(null); // Reference for the Avatar component

  useEffect(() => {
    // Create a GSAP timeline to control the order of animations
    const timeline = gsap.timeline();

    // Animate the Avatar first
    timeline.fromTo(
      avatarRef.current, // Target the Avatar component
      { opacity: 0, scale: 1.4 },
      { opacity: 1, scale: 1, duration: 1.3, ease: "power3.inOut" }
    );

    // Animate the Text elements after the Avatar animation
    timeline.fromTo(
      textRef.current, // Target the text container
      { opacity: 0, y: 100 },
      { opacity: 1, y: 0, duration: 1.8, ease: "power3.out" },
      "-=0.2" // Sync with the avatar animation, start 0.8 seconds earlier
    );

    // Cleanup function to kill the timeline when the component is unmounted
    return () => {
      timeline.kill();
    };
  }, []);

  return (
    <Bounded
      data-slice-type={slice.slice_type}
      data-slice-variation={slice.variation}
    >
      <div className="grid gap-x-8 gap-y-6 md:grid-cols-[2fr,1fr]">
        <Heading as="h1" size="xl" className="col-start-1">
          <PrismicRichText field={slice.primary.heading} />
        </Heading>
        <div
          className="prose prose-xl prose-slate prose-invert col-start-1"
          ref={textRef} // Assign the ref to the text container
        >
          <PrismicRichText field={slice.primary.description} />
        </div>
        <Avatar
          // ref={avatarRef} // Pass the ref to the Avatar component
          image={slice.primary.avatar}
          className="row-start-1 max-w-sm md:col-start-2 md:row-end-3"
        />
      </div>
    </Bounded>
  );
};

export default Biography;
