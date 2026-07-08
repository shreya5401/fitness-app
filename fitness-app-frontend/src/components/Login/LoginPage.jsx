import { Button } from "@mui/material";
import gymHero from "../../assets/gym-hero.png";
import "./LoginPage.css";

const LoginPage = ({ onLogin }) => {
  return (
    <div className="login-page" style={{ backgroundImage: `url(${gymHero})` }}>
      <div className="login-overlay">
        <h1 className="login-logo">REPTRACK</h1>
        <Button className="login-btn" onClick={onLogin}>
          Login
        </Button>
      </div>
    </div>
  );
};

export default LoginPage;
