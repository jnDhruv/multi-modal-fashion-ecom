import searchsvg from "../../assets/icons/search.svg";
import homesvg from "../../assets/icons/home.svg";
import shoppingbagsvg from "../../assets/icons/shopping-bag.svg";
import "./Header.css";

function Header() {
  return (
    <header className="header">
        <h1>ATTIRELY</h1>
        <div className="header-buttons">
            <button className="search-button header-button">
                <img className="icon" src={searchsvg} alt="Search" />
            </button>
            <button className="home-button header-button">
                <img className="icon" src={homesvg} alt="Home" />
            </button>
            <button className="cart-button header-button">
                <img className="icon" src={shoppingbagsvg} alt="Cart" />
            </button>
        </div>
    </header>
    
  );
}

export default Header;