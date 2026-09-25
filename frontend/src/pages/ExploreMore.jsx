import "./ExploreMore.css";
import { useNavigate } from "react-router";

function ExploreMore() {
  const navigate = useNavigate();

  return (
    <div className="explore-page">
      <h1>EXPLORE MORE</h1>

      <div className="explore-container">

        {/* MODEL */}
        <img
          src="/images/model.jpg"
          className="explore-image model"
          alt="Model"
        />


        {/* CORSET - CLICKABLE */}
        <div
          className="clickable-item corset"
          onClick={() => navigate("/category/Corset")}
        >
          <img
            src="/images/corset.jpg"
            alt="Corset"
          />
        </div>


        {/* ACCESSORIES - CLICKABLE */}
        <div
          className="clickable-item accessories"
          onClick={() => navigate("/category/Accessories")}
        >
          <img
            src="/images/accessories.jpg"
            alt="Accessories"
          />
        </div>


        {/* PURSE - CLICKABLE */}
        <div
          className="clickable-item purse"
          onClick={() => navigate("/category/Bag")}
        >
          <img
            src="/images/purse.jpg"
            alt="Bag"
          />
        </div>


        {/* SKIRT - CLICKABLE */}
        <div
          className="clickable-item skirt"
          onClick={() => navigate("/category/Skirt")}
        >
          <img
            src="/images/skirts.jpg"
            alt="Skirt"
          />
        </div>


        {/* BOOTS - CLICKABLE */}
        <div
          className="clickable-item boots"
          onClick={() => navigate("/category/Boots")}
        >
          <img
            src="/images/boots.jpg"
            alt="Boots"
          />
        </div>


        {/* CONNECTOR LINES */}
        <div className="line corset-line" />
        <div className="line accessories-line" />
        <div className="line purse-line" />
        <div className="line skirt-line" />
        <div className="line boots-line" />

      </div>
    </div>
  );
}

export default ExploreMore;