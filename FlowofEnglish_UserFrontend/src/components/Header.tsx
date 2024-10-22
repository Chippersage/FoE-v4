
import main_logo from "../assets/Img/main-logo.png";
import "../Styles/Header.css";
import chipper_sage_logo from "../assets/Img/chipper-sage-logo.png";
// import Logout from "../Logout/Logout";

const Header = () => {
  return (
    <div>
      <div className="header">
        <img src={main_logo} alt="" className="company-logo" />
        {/* <h5>
          <span className="flowhead">Flow Of English</span> -{" "}
          <span className="learnerhead">Learner</span>
        </h5> */}
        <img src={chipper_sage_logo} alt="" className="chipper-logo" />
        {/* <div className="logout-button">
        <Logout />
      </div> */}
      </div>
    </div>
  );
};

export default Header;
