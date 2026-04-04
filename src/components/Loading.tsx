// src/components/Loading.tsx
import logo from "../assets/logoo.png";

interface LoadingProps {
  message?: string;
}

const Loading = ({ message = "Processing..." }: LoadingProps) => {
  return (
    <div className="loading-screen">
      <img src={logo} alt="App Logo" className="loading-logo" />
      <p className="loading-message">{message}</p>

      <style>{`
        .loading-screen {
          display: flex;
          flex-direction: column;
          justify-content: center;
          align-items: center;
          height: 100vh;
          background-color: transparent;
        }

        .loading-logo {
          width: 60px;
          height: 60px;
          border-radius: 100%;
          margin-bottom: 20px;
          animation: boom 1s ease-in-out infinite alternate,
                     glow 2s ease-in-out infinite alternate;
        }

        .loading-message {
          font-size: 18px;
          color: #333;
        }

        @keyframes boom {
          0% { transform: scale(1); }
          50% { transform: scale(1.3); }
          100% { transform: scale(1); }
        }

        @keyframes glow {
          0% { filter: drop-shadow(0 0 5px rgba(19, 196, 34, 0.5)); }
          50% { filter: drop-shadow(0 0 20px rgba(76, 133, 68, 0.8)); }
          100% { filter: drop-shadow(0 0 5px rgba(194, 221, 202, 0.5)); }
        }
      `}</style>
    </div>
  );
};

export default Loading;