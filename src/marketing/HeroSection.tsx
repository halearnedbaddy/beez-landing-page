import { APP_URL } from "./links";

const waveform = [
  8, 14, 23, 32, 15, 10, 21, 35, 45, 23, 14, 31, 51, 61, 39, 22, 13, 26, 43,
  31, 17, 11, 22, 36, 49, 27, 14, 9, 20, 33, 45, 30, 18, 11, 23, 35, 25, 15,
  8,
];

function BeeMark() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M12 5c-3.6 0-6 3.1-6 7.2 0 3.5 2.4 6.1 6 7.8 3.6-1.7 6-4.3 6-7.8C18 8.1 15.6 5 12 5Z" />
      <path d="M6.5 10h11M6.2 13.7h11.6M8 17h8M10 5c0-2 1-3 2-3s2 1 2 3" />
      <path d="m6.2 7.5-2-1.8m13.6 1.8 2-1.8" />
    </svg>
  );
}

export default function HeroSection() {
  return (
    <header className="hero">
      <div className="hero-copy">
        <span className="tag">
          Voice-first infrastructure for the informal economy
        </span>
        <h1>
          Beez helps street vendors sell,
          <br />
          sell, get paid,
          <br />
          get counted,
          <br />
          <span>just by</span>
          <br />
          <span>speaking.</span>
        </h1>
        <p className="hero-lead">
          Voice first, typing optional.
          <br />
          No forms to fill in.
        </p>
        <div className="hero-actions">
          <a className="hero-button" href={APP_URL} rel="noopener noreferrer">
            Launch app
          </a>
          <a className="hero-button hero-button-outline" href="#/vision">
            See the vision
          </a>
        </div>
      </div>

      <div className="hero-visual" aria-label="Beez shop and order preview">
        <div className="phone">
          <div className="phone-screen">
            <div className="phone-island" />
            <div className="shop-heading">
              <BeeMark />
              <span>
                <b>Beez</b>
                <i />
                Fresh Corner Shop
              </span>
            </div>

            <div className="market-photo" aria-hidden="true">
              <div className="market-rice">🌾</div>
              <div className="market-tomatoes">🍅</div>
              <div className="market-greens">🥬</div>
            </div>

            <div className="voice-note">
              Today I have rice, oil, and tomatoes...
            </div>

            <div className="waveform" aria-hidden="true">
              {waveform.map((height, index) => (
                <i key={index} style={{ height }} />
              ))}
            </div>

            <div className="price-list">
              <span>KES 150/kg</span>
              <span>KES 350</span>
              <span>KES 100/kg</span>
            </div>
            <div className="phone-order-glow" />
          </div>
        </div>

        <div className="float-badge rider-badge">
          <span aria-hidden="true">🛵</span> Rider on the way
          <span aria-hidden="true">🌱</span>
        </div>

        <div className="float-badge paid-badge">
          <span className="paid-mpesa" aria-hidden="true">
            M
          </span>
          Paid with M-Pesa
        </div>

        <div className="order-card">
          <span className="order-check" aria-hidden="true">
            ✓
          </span>
          <span>
            New order, paid: 3 items,
            <b>KES 600</b>
            <small>M-Pesa</small>
          </span>
        </div>
      </div>
    </header>
  );
}
