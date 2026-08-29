import React, { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

import "./Section1.css";
import hangingSandals from "../../assets/images/hanging-sandals.png";
import hangingBlackShirt from "../../assets/images/hanging-black-shirt.png";

gsap.registerPlugin(ScrollTrigger);

function Section1() {
  const sectionRef = useRef(null);
  const leftGroupRef = useRef(null);
  const rightGroupRef = useRef(null);

  useEffect(() => {
    const ctx = gsap.context(() => {

      // Left image + text
      gsap.fromTo(
        leftGroupRef.current,
        {
          x: -500,
          opacity: 0,
        },
        {
          x: 0,
          opacity: 1,
          duration: 1.5,
          ease: "power3.out",
          scrollTrigger: {
            trigger: sectionRef.current,
            start: "top 80%",
            toggleActions: "play none none reverse",
          },
        }
      );

      // Right image + text
      gsap.fromTo(
        rightGroupRef.current,
        {
          x: 500,
          opacity: 0,
        },
        {
          x: 0,
          opacity: 1,
          duration: 1.5,
          ease: "power3.out",
          scrollTrigger: {
            trigger: sectionRef.current,
            start: "top 80%",
            toggleActions: "play none none reverse",
          },
        }
      );

    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section ref={sectionRef} className="section1">

      {/* LEFT */}
      <div ref={leftGroupRef} className="section1-group">
        <img
          src={hangingSandals}
          alt="Hanging Sandals"
        />

        <div className="section1-text section1-text-left">
          <h1>You want it?</h1>
        </div>
      </div>

      {/* RIGHT */}
      <div ref={rightGroupRef} className="section1-group">
        <img
          src={hangingBlackShirt}
          alt="Hanging Black Shirt"
        />

        <div className="section1-text section1-text-right">
          <h1>You Got It.</h1>
        </div>
      </div>

    </section>
  );
}

export default Section1;