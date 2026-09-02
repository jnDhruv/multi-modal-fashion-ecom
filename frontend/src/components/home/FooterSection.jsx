import "./FooterSection.css";
import footerBackground from "../../assets/images/footer-background.png";

function FooterSection(){
    return (
        <div className="site-footer">
            <img src={footerBackground} alt="Attirely footer background" />
        </div>
    );
}

export default FooterSection;
