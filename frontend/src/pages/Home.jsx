import { useEffect } from "react";
import Hero from "../components/home/Hero";
import Section1 from "../components/home/Section1";
import StartSearching from "../components/home/StartSearching";
import Section3 from "../components/home/Section3";
import FooterSection from "../components/home/FooterSection";
import "./Home.css";

function Home() {
   useEffect(() => {
    if (window.location.hash === "#search") {
      setTimeout(() => {
        document
          .getElementById("search")
          ?.scrollIntoView({
            behavior: "smooth",
          });
      }, 100);
    }
  }, []);
  return (
    <>
        <Hero />
        <Section1 />
        <StartSearching />
        <Section3 />
        <FooterSection />
        
    </>
  );
}

export default Home;
