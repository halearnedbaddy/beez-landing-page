import { APP_URL, CONTACT_EMAIL } from "./links";
import { ArrowUpRight, Mail, MapPin } from "lucide-react";

export default function SiteFooter() {
  return (
    <footer className="site-footer">
      <div className="fc">
        <div className="fbrand">
          <a className="flogo" href="#/" aria-label="Beez home">
            <img src="/beez-logo.png" alt="" aria-hidden="true" />
          </a>
          <p className="footer-tagline">Smart tools. Real growth.</p>
          <p className="footer-description">Beez gives small businesses smart tools for real growth.</p>
        </div>
        <nav aria-label="Explore">
          <h4>Discover Beez</h4>
          <a href="#/">Home</a>
          <a href="#/vision">Our vision</a>
          <a href="#/problem">The challenge</a>
          <a href="#/offer">What we offer</a>
          <a href="#/features">Features</a>
          <a href="#/faq">FAQ</a>
        </nav>
        <div className="footer-contact">
          <h4>Get in touch</h4>
          <p className="footer-location"><MapPin aria-hidden="true" /> Mombasa, Kenya</p>
          <a className="footer-email" href={`mailto:${CONTACT_EMAIL}`}>
            <Mail aria-hidden="true" /> {CONTACT_EMAIL}
          </a>
          <a className="footer-launch" href={APP_URL} target="_blank" rel="noopener noreferrer">
            Launch app <ArrowUpRight aria-hidden="true" />
          </a>
        </div>
      </div>
      <div className="fbottom">
        <span>© {new Date().getFullYear()} Beez. All rights reserved.</span>
        <span>Built for small businesses.</span>
      </div>
    </footer>
  );
}
