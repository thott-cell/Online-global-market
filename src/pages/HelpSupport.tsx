import { useState } from "react";
import { toast } from "react-hot-toast";

const ContactForm = () => {
  const [formData, setFormData] = useState({ name: "", email: "", message: "" });
  const [submitted, setSubmitted] = useState(false);

  const handleChange = (e: { target: { name: any; value: any; }; }) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: { preventDefault: () => void; }) => {
    e.preventDefault();

    try {
      const response = await fetch("https://formspree.io/f/mwvwandw", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        setSubmitted(true);
        setFormData({ name: "", email: "", message: "" });
        toast.success("Your message has been sent!");
      } else {
        toast.error("Oops! Something went wrong. Please try again.");
      }
    } catch {
      toast.error("Network error. Please check your connection.");
    }
  };

  return (
    <div style={{ maxWidth: "500px", margin: "auto", textAlign: "center" }}>
      {!submitted ? (
        <form onSubmit={handleSubmit}>
          <h2>Contact Us</h2>

          <label>Name</label>
          <input
            type="text"
            name="name"
            required
            value={formData.name}
            onChange={handleChange}
            style={{ width: "100%", padding: "10px", margin: "10px 0" }}
          />

          <label>Email</label>
          <input
            type="email"
            name="email"
            required
            value={formData.email}
            onChange={handleChange}
            style={{ width: "100%", padding: "10px", margin: "10px 0" }}
          />

          <label>Message</label>
          <textarea
            name="message"
            required
            value={formData.message}
            onChange={handleChange}
            style={{ width: "100%", padding: "10px", margin: "10px 0" }}
          />

          <button type="submit" style={{ padding: "10px 20px" }}>
            Send Message
          </button>
        </form>
      ) : (
        <div>
          <h2>Thank you!</h2>
          <p>Your message has been sent. We’ll get back to you soon.</p>
        </div>
      )}
    </div>
  );
};

export default ContactForm;