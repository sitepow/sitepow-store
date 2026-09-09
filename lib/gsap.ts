"use client";

import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger, useGSAP);
  ScrollTrigger.config({ ignoreMobileResize: true });

  if (document.readyState === "complete") {
    ScrollTrigger.refresh();
  } else {
    window.addEventListener("load", () => ScrollTrigger.refresh());
  }

  if (typeof document !== "undefined" && "fonts" in document) {
    document.fonts.ready.then(() => {
      ScrollTrigger.refresh();
    });
  }
}

export { gsap, ScrollTrigger, useGSAP };
