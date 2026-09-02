import AttirelyMainImage from "../../assets/images/ATTIRELY.png";
import { motion } from "framer-motion";
import "./Hero.css";

function Hero() {
  const text = "ATTIRELY";

  // ENTER just takes the visitor to the next section — no routing/API,
  // purely a same-page smooth scroll.
  const handleEnterClick = () => {
    document
      .getElementById("showcase")
      ?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <div className="hero">
      <img src={AttirelyMainImage} alt="Attirely Main" className="hero__image" />
      <div className="hero__text">
        <div>
          {text.split("").map((letter, index) => (
            <motion.span
              key={index}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{
                delay: index * 0.2,
                duration: 0.2,
              }}
              className={
                index === 2
                  ? "hero__letter hero__letter--accent-1"
                  : index === 7
                  ? "hero__letter hero__letter--accent-2"
                  : "hero__letter"
              }
            >
              {letter}
            </motion.span>
          ))}
        </div>

        <div className="hero__subtext">
          <p>FIND</p>
          <p>YOUR</p>
          <p style={{ color: "#313940" }}>STYLE</p>
        </div>
      </div>

      <button
        type="button"
        className="hero__enter-btn"
        onClick={handleEnterClick}
      >
        ENTER
      </button>
    </div>
  );
}

export default Hero;
