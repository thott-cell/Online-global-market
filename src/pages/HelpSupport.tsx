import { FaFacebookF, FaTwitter, FaInstagram, FaLinkedin } from "react-icons/fa";

const HelpSupportPage = ({ onNavigate }: { onNavigate: (page: string) => void }) => {
  return (
    <div className="mobile-help">

      
      {/* SUPPORT */}
      <div className="mh-section">
        <h4>Support</h4>
        <p onClick={() => onNavigate("helpCenter")}>Help Center</p>
        <p onClick={() => onNavigate("safety")}>Safety Tips</p>
        <p onClick={() => onNavigate("contact")}>Contact Us</p>
      </div>

      {/* COMPANY */}
      <div className="mh-section">
        <h4>Company</h4>
        <p onClick={() => onNavigate("about")}>About Us</p>
        <p onClick={() => onNavigate("careers")}>Careers</p>
        <p onClick={() => onNavigate("blog")}>Blog</p>
      </div>

      {/* LEGAL */}
      <div className="mh-section">
        <h4>Legal</h4>
        <p onClick={() => onNavigate("privacy")}>Privacy Policy</p>
        <p onClick={() => onNavigate("terms")}>Terms & Conditions</p>
      </div>

      {/* NEWSLETTER */}
      <div className="mh-section">
        <h4>Stay Updated</h4>
        <p className="mh-desc">Get latest deals and updates</p>

        <div className="mh-newsletter">
          <input placeholder="Enter your email" />
          <button>Subscribe</button>
        </div>
      </div>

      {/* SOCIALS */}
      <div className="mh-socials">
        <span><FaFacebookF /></span>
        <span><FaTwitter /></span>
        <span><FaInstagram /></span>
        <span><FaLinkedin /></span>
      </div>

      {/* FOOTER */}
      <div className="mh-bottom">
        © 2026 Campus Marketplace
      </div>

    </div>
  );
};

export default HelpSupportPage;