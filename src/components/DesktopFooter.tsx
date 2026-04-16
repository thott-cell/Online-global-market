import { FaFacebookF, FaTwitter, FaInstagram, FaLinkedin } from "react-icons/fa";

export default function DesktopFooter() {
  return (
    <footer className="footer">
      <div className="footer-container">

        {/* BRAND */}
        <div className="footer-section">
          <h2 className="logo">CampusMarket</h2>
          <p className="desc">
            Buy and sell easily within your campus. Fast, safe and reliable.
          </p>

          {/* SOCIALS */}
          <div className="socials">
            <span><FaFacebookF /></span>
            <span><FaTwitter /></span>
            <span><FaInstagram /></span>
            <span><FaLinkedin /></span>
          </div>
        </div>

        {/* LINKS */}
        <div className="footer-section">
          <h4>Company</h4>
          <p>About Us</p>
          <p>Careers</p>
          <p>Blog</p>
        </div>

        <div className="footer-section">
          <h4>Support</h4>
          <p>Help Center</p>
          <p>Safety Tips</p>
          <p>Contact Us</p>
        </div>

        <div className="footer-section">
          <h4>Legal</h4>
          <p>Privacy Policy</p>
          <p>Terms & Conditions</p>
        </div>

        {/* NEWSLETTER */}
        <div className="footer-section">
          <h4>Stay Updated</h4>
          <p className="desc">Get latest deals and updates</p>

          <div className="newsletter">
            <input placeholder="Enter your email" />
            <button>Subscribe</button>
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