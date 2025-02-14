
import main_logo from "../assets/Img/main-logo.png";
import "../Styles/Header.css";
import chipper_sage_logo from "../assets/Img/chipper-sage-logo.png";
import { Link } from "react-router-dom";
// import Logout from "../Logout/Logout";

const Header = () => {
  return (
    <div>
      <div className="header">
        <Link to={"/"}>
          <img src={main_logo} alt="" className="company-logo" />
        </Link>
        
        <img src={chipper_sage_logo} alt="" className="chipper-logo" />
        {/* <div className="logout-button">
        <Logout />
      </div> */}
      </div>
    </div>
  );
};

export default Header;
