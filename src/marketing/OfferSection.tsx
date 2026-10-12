import { APP_URL } from "./links";

function MerchantIllustration() {
  return (
    <svg viewBox="0 0 180 120" role="img" aria-label="Voice-powered shop">
      <g fill="none" stroke="#e7d8a3" strokeLinecap="round" strokeLinejoin="round">
        <path strokeWidth="2" d="M14 104h148M31 101V54m0 0c0-9 6-14 13-14s13 5 13 14v47m-26-33h26m-26 11h26m-26 11h26m-13-50v56" />
        <path stroke="#edc64e" strokeWidth="2.5" d="M71 50h91l-8-23H79l-8 23Zm0 0c0 7 11 7 11 0 0 7 12 7 12 0 0 7 12 7 12 0 0 7 12 7 12 0 0 7 12 7 12 0 0 7 12 7 12 0 0 7 12 7 12 0" />
        <path strokeWidth="2" d="M78 51v51m75-51v51m-75-35h75m-75 18h75m-72-29h18v10H81zm28 0h18v10h-18zm28 0h14v10h-14zM81 75h18v10H81zm28 0h18v10h-18zm28 0h14v10h-14z" />
        <path strokeWidth="2" d="M18 105h36m-18 0V91m-5 15 5-8 5 8" />
      </g>
    </svg>
  );
}

function CustomerIllustration() {
  return (
    <svg viewBox="0 0 180 120" role="img" aria-label="Customer order and payment">
      <g fill="none" stroke="#a7c6c0" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="58" y="8" width="64" height="103" rx="13" />
        <path d="M77 15h26" />
        <rect x="64" y="24" width="52" height="69" rx="5" stroke="#879a9d" />
        <path d="M77 99h26" />
      </g>
      <path fill="#70cf91" d="M90 34c-4 5-11 7-14 13-6 11 2 24 14 24s20-13 14-24c-3-6-10-8-14-13Z" />
      <path d="m83 51 5 5 10-11" fill="none" stroke="#173c31" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
      <rect x="75" y="78" width="30" height="8" rx="4" fill="#60d38b" />
    </svg>
  );
}

function DeliveryIllustration() {
  return (
    <svg viewBox="0 0 180 120" role="img" aria-label="Local rider delivery">
      <g fill="none" stroke="#84949c" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="m7 81 38-14 23 11 37-24 30 13 35-12M17 99l36-14 23 9 34-18 26 11 30-16" />
        <path d="M38 27c0-10 7-17 16-17s16 7 16 17c0 13-16 31-16 31S38 40 38 27Z" stroke="#eac84e" strokeWidth="2" />
        <circle cx="54" cy="27" r="5" stroke="#eac84e" strokeWidth="2" />
        <path d="M127 21c0-7 5-12 11-12s11 5 11 12c0 9-11 21-11 21s-11-12-11-21Z" />
        <circle cx="138" cy="21" r="3" />
      </g>
      <g fill="none" stroke="#e7c84f" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M47 69h34l20 18h-39m7-18-7 18m39-18h16" />
        <circle cx="69" cy="91" r="8" />
        <circle cx="105" cy="91" r="8" />
        <path d="m84 62 6-14 12 4 5 14m-21-18-7-5" />
        <path d="M107 66h16l8 8-9 7" />
      </g>
      <g fill="none" stroke="#76d392" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="111" y="46" width="22" height="14" rx="3" />
        <path d="M116 42h12m-10 11 3 3 6-7" />
      </g>
    </svg>
  );
}

const offers = [
  {
    title: "A Voice-Powered Shop",
    audience: "For Merchants",
    description:
      "Merchants say what they sell and Beez builds the shop page, the product list and a short video intro.",
    Illustration: MerchantIllustration,
  },
  {
    title: "Order and Pay by Phone",
    audience: "For Customers",
    description:
      "Customers open a link, pick what they want and pay with M-Pesa. No app to install and no account to create.",
    Illustration: CustomerIllustration,
  },
  {
    title: "Local Delivery",
    audience: "For Riders",
    description:
      "Nearby riders pick up paid orders and deliver them to the customer's pin, confirmed with a delivery code.",
    Illustration: DeliveryIllustration,
  },
];

export default function OfferSection() {
  return (
    <section className="offer-page" id="offer">
      <header className="section-heading">
        <h2>
          What we <span>offer</span>
        </h2>
        <p>One simple tool for the three people in every street-market sale.</p>
      </header>

      <div className="offer-grid">
        {offers.map(({ title, audience, description, Illustration }) => (
          <article className="offer-card" key={title}>
            <div className="offer-art">
              <Illustration />
            </div>
            <h3>{title}</h3>
            <p className="offer-audience">{audience}</p>
            <p className="offer-description">{description}</p>
            <a href="#/features">Learn more <span aria-hidden="true">→</span></a>
          </article>
        ))}
      </div>

      <div className="offer-action">
        <a className="nav-cta" href={APP_URL} rel="noopener noreferrer">
          Get started
        </a>
      </div>
    </section>
  );
}
