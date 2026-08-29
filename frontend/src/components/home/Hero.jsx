import AttirelyMainImage from "../../assets/images/ATTIRELY.png";
import { color, motion } from "framer-motion";
import { useState } from "react";
import "./Hero.css";

function Hero() {
    const  text = "ATTIRELY";
  return (
        <div className="home-container">
      <img src={AttirelyMainImage} alt="Attirely Main" className="home-image" />
      <div className="home-text">
        <div>
            {text.split("").map((letter, index) => (
            <motion.span
                key={index}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{
                delay: index * 0.15,
                duration: 0.2,
                }}
                className={index === 2 ? "highlight-t" : index === 7 ? "highlight-y" : ""}
            >
                {letter}
            </motion.span>
            ))}
        </div>

        <div className="home-subtext">
            <p>FIND</p>
            <p>YOUR</p>
            <p style={{ color: "#313940" }}>STYLE</p>
        </div>
      </div>

      <button className="enter-button">ENTER</button>
    </div>
  );
}

export default Hero;