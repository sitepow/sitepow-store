"use client";

import React, { useRef } from "react";
import { useGSAP } from "@gsap/react";
import { gsap } from "@/lib/gsap";

interface GsapRevealProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  y?: number;
  x?: number;
  scale?: number;
  opacity?: number;
  duration?: number;
  delay?: number;
  stagger?: number;
  childSelector?: string;
  start?: string;
  once?: boolean;
}

export function GsapReveal({
  children,
  className,
  y = 30,
  x = 0,
  scale = 1,
  opacity = 0,
  duration = 0.8,
  delay = 0,
  stagger = 0,
  childSelector,
  start = "top 85%",
  once = true,
  ...props
}: GsapRevealProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const targets = childSelector
        ? containerRef.current?.querySelectorAll(childSelector)
        : containerRef.current;

      if (!targets) return;

      gsap.from(targets, {
        y,
        x,
        scale,
        opacity,
        duration,
        delay,
        stagger: stagger || undefined,
        ease: "power3.out",
        scrollTrigger: {
          trigger: containerRef.current,
          start,
          toggleActions: once
            ? "play none none none"
            : "play reverse play reverse",
        },
      });
    },
    {
      scope: containerRef,
      dependencies: [
        y,
        x,
        scale,
        opacity,
        duration,
        delay,
        stagger,
        childSelector,
        start,
        once,
      ],
    }
  );

  return (
    <div ref={containerRef} className={className} {...props}>
      {children}
    </div>
  );
}
