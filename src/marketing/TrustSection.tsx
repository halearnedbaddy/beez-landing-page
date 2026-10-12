import paymentsImg from "@/assets/features/trust-payments.jpg";
import deliveryImg from "@/assets/features/trust-delivery.jpg";
import ridersImg from "@/assets/features/trust-riders.jpg";
import privacyImg from "@/assets/features/trust-privacy.jpg";

const safeguards = [
  {
    title: "Payments confirmed first",
    description: "An order counts only after the payment is verified.",
    status: "SECURED",
    img: paymentsImg,
    alt: "A phone showing a confirmed payment at a market stall",
  },
  {
    title: "Right order, right person",
    description: "A 4-digit delivery code confirms the handover.",
    status: "MATCHED",
    img: deliveryImg,
    alt: "A rider handing a parcel to a customer holding a phone",
  },
  {
    title: "Approved riders",
    description: "The Beez team reviews riders before they take any job.",
    status: "VERIFIED",
    img: ridersImg,
    alt: "A reviewed delivery rider beside his motorbike",
  },
  {
    title: "Only what is needed",
    description:
      "We collect phone numbers, location and shop media only to run orders and deliveries.",
    status: "PRIVATE",
    img: privacyImg,
    alt: "Hands holding a phone showing a privacy lock",
  },
];

export default function TrustSection() {
  return (
    <section className="trust-page" id="trust">
      <header className="section-heading trust-heading">
        <h2>Safe by design.</h2>
        <p>When money and deliveries are involved, trust is the product.</p>
      </header>

      <div className="trust-grid">
        {safeguards.map((item) => (
          <article className="trust-card" key={item.title}>
            <span className="status-pill">
              {item.status} <i />
            </span>
            <img src={item.img} alt={item.alt} loading="lazy" />
            <h3>{item.title}</h3>
            <p>{item.description}</p>
          </article>
        ))}
      </div>
    </section>
  );
}
