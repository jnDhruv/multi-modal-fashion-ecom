// import React from "react";
import "./Section3.css";
import Corset from "../../assets/images/DenimCorset.png";
import womenModel from "../../assets/images/womenModel.png";
import skirt from "../../assets/images/skirt.png";
import purse from "../../assets/images/purse.png";
import kneeBoot from "../../assets/images/kneeBoot.png";
import sunglass from "../../assets/images/sunglass.png";
import redCap from "../../assets/images/redCap.png";

function Section3() {
  return (
    <div className="gallery">
      <div className="gallery__grid">
        <img className="gallery__thumb" src={Corset} alt="Denim Corset" />
        <img className="gallery__thumb" src={womenModel} alt="Women Model" />
        <img className="gallery__thumb" src={skirt} alt="Skirt" />
        <img className="gallery__thumb" src={purse} alt="Purse" />
        <img className="gallery__thumb" src={kneeBoot} alt="Knee Boot" />
        <img className="gallery__thumb" src={sunglass} alt="Sunglass" />
        <img className="gallery__thumb" src={redCap} alt="Red Cap" />
      </div>
      <div className="gallery__panel">
        <div className="gallery__panel-image">
          <img src={Corset} alt="Denim Corset" />
        </div>
        <div className="gallery__note">
          <p>
            A structured denim corset with a vintage-inspired silhouette,
            featuring a fitted bust, defined waist, and pointed hem. The visible
            seam detailing and muted washed-denim finish give it a bold yet
            refined Y2K aesthetic. Pair it with high-waisted jeans, a flowy maxi
            skirt, or tailored trousers for a stylish contrast between
            structured and relaxed pieces. 
            <div>
                Style: Y2K • Vintage • Edgy •
                Feminine
            </div>
            <div>
                 Fit: Structured, body-contouring Best paired with:
                High-waisted bottoms, oversized shirts, leather accessories, minimal
                jewelry

            </div>
          </p>
        </div>
      </div>
    </div>
  );
}

export default Section3;
