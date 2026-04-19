import { FaFacebookF, FaTwitter, FaInstagram, FaLinkedin } from "react-icons/fa";

type Props = {
  onNavigate: (page: string) => void;
};

export default function DesktopFooter({ onNavigate }: Props) {
  return (
    <footer className="footer">
      <div className="footer-container">

        {/* BRAND */}
        <div className="footer-section">
          <h2 className="logo">CampusMarket</h2>
          <p className="desc">
            Buy and sell easily within your campus. Fast, safe and reliable.
          </p>

          <div className="socials">
            <span><FaFacebookF /></span>
            <span><FaTwitter /></span>
            <span><FaInstagram /></span>
            <span><FaLinkedin /></span>
          </div>
        </div>

        {/* COMPANY */}
        <div className="footer-section">
          <h4>Company</h4>
          <p onClick={() => onNavigate("about")}>About Us</p>
          <p onClick={() => onNavigate("careers")}>Careers</p>
          <p onClick={() => onNavigate("blog")}>Blog</p>
        </div>

        {/* SUPPORT */}
        <div className="footer-section">
          <h4>Support</h4>
          <p onClick={() => onNavigate("help")}>Help Center</p>
          <p onClick={() => onNavigate("safety")}>Safety Tips</p>
          <p onClick={() => onNavigate("contact")}>Contact Us</p>
        </div>

        {/* LEGAL */}
        <div className="footer-section">
          <h4>Legal</h4>
          <p onClick={() => onNavigate("privacy")}>Privacy Policy</p>
          <p onClick={() => onNavigate("terms")}>Terms & Conditions</p>
        </div>

        {/* NEWSLETTER */}
        <div className="footer-section">
          <h4>Stay Updated</h4>
          <p className="desc">Get latest deals and updates</p>

          <div className="newsletter">
            <input type="email" placeholder="Enter your email" />
            <button onClick={() => alert("Subscribed (connect backend later)")}>
              Subscribe
            </button>
          </div>
        </div>

      </div>

      {/* BOTTOM */}
      <div className="footer-bottom">
        © 2026 Campus Marketplace — All rights reserved.
      </div>
    </footer>
  );
}