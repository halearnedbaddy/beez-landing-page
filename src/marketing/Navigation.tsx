import { useState } from "react";
import { APP_URL } from "./links";

export default function Navigation() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <nav className="site-nav">
      <a className="brand" href="#/" aria-label="Beez home">
        <img className="brand-image" src="/beez-logo.png" alt="" aria-hidden="true" />
      </a>

      <div className={`nav-links${menuOpen ? " is-open" : ""}`} id="site-menu">
        <a href="#/offer" onClick={() => setMenuOpen(false)}>What we offer</a>
        <a href="#/vision" onClick={() => setMenuOpen(false)}>Vision</a>
        <a href="#/features" onClick={() => setMenuOpen(false)}>Features</a>
        <a href="#/faq" onClick={() => setMenuOpen(false)}>FAQ</a>
        <a href="/sell" onClick={() => setMenuOpen(false)}>Sell on Beez</a>
        <a className="nav-cta" href={APP_URL} rel="noopener noreferrer">
          Launch app
        </a>
      </div>
      <button
        className="menu-toggle"
        type="button"
        aria-controls="site-menu"
        aria-expanded={menuOpen}
        aria-label={menuOpen ? "Close navigation menu" : "Open navigation menu"}
        onClick={() => setMenuOpen((open) => !open)}
      >
        <span />
        <span />
        <span />
      </button>
    </nav>
  );
}
