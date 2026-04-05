// src/components/SplashScreen.tsx
import { useEffect } from "react";
import logo from "../assets/logo.png";

type SplashScreenProps = {
  onFinish: () => void;
  duration?: number; // how long the splash shows (ms)
};

const SplashScreen = ({ onFinish, duration = 10000 }: SplashScreenProps) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onFinish();
    }, duration);

    return () => clearTimeout(timer);
  }, [onFinish, duration]);

  return (
    <div className="splash-screen">
      <img src={logo} alt="Logo" className="splash-logo" />
      <style>{`
        .splash-screen {
          position: fixed;
          top: 0; left: 0;
          width: 100%;
          height: 100%;
          background: #ffff;
          display: flex;
          justify-content: center;
          align-items: center;
          z-index: 9999;
        }

        .splash-logo {
          width: 300px;
          height: 300;
          animation: scaleUp 1s ease-in-out infinite alternate;
        }

        @keyframes scaleUp {
          0% { transform: scale(1); }
          100% { transform: scale(1.1); }
        }
      `}</style>
    </div>
  );
};

export default SplashScreen;