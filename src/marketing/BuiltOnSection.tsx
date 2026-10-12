import paymentsImg from "@/assets/features/built-payments.jpg";
import smsImg from "@/assets/features/built-sms.jpg";
import mapsImg from "@/assets/features/built-maps.jpg";
import pushImg from "@/assets/features/built-push.jpg";
import languagesImg from "@/assets/features/built-languages.jpg";

const tools = [
  {
    title: "Mobile payments",
    description: "Pay securely using your local mobile money or digital wallets.",
    status: "(P) Active",
    img: paymentsImg,
    alt: "A customer paying a market vendor by phone",
    className: "payment-tool",
  },
  {
    title: "SMS alerts",
    description: "Reaches phones with no data.",
    status: "(P) Active",
    img: smsImg,
    alt: "A basic feature phone showing a new message",
    className: "",
  },
  {
    title: "GPS and maps",
    description: "Delivery pins and landmarks.",
    status: "LIVE",
    img: mapsImg,
    alt: "A phone showing a delivery location pin on a map",
    className: "",
  },
  {
    title: "Push notifications",
    description: "Order alerts straight to the browser.",
    status: "LIVE",
    img: pushImg,
    alt: "A woman receiving an order alert on her phone",
    className: "",
  },
  {
    title: "Multi-language support",
    description:
      "The full app and voice interface, available in multiple local, national, and international languages to match how your market speaks.",
    status: "",
    img: languagesImg,
    alt: "A vendor and customer talking across a market stall",
    className: "language-tool",
  },
];

export default function BuiltOnSection() {
  return (
    <section className="built-page" id="built-on">
      <header className="section-heading built-heading">
        <h2>Built on what people already use.</h2>
        <p>
          No new hardware and nothing to download. Beez runs in the browser on
          the phones people already carry.
        </p>
      </header>

      <div className="built-grid">
        {tools.map((tool) => (
          <article
            className={`built-card ${tool.className}`}
            key={tool.title}
          >
            <div className="built-card-top">
              <img src={tool.img} alt={tool.alt} loading="lazy" />
              {tool.status && (
                <span className="status-pill">
                  {tool.status} <i />
                </span>
              )}
            </div>
            <h3>{tool.title}</h3>
            <p>{tool.description}</p>
          </article>
        ))}
      </div>
    </section>
  );
}
