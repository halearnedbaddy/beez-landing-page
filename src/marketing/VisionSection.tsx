import PilotMapSection from "./PilotMapSection";
import commerceImage from "@/assets/vision/commerce.jpg";
import dataImage from "@/assets/vision/data.jpg";
import financeImage from "@/assets/vision/finance.jpg";
import growthImage from "@/assets/vision/growth.jpg";
import transactionsImage from "@/assets/features/records.jpg";
import trustImage from "@/assets/features/trust-payments.jpg";

const stages = [
  {
    number: "01",
    title: "Commerce:",
    description:
      "Merchants sell by voice. Customers order and pay with M-Pesa. Riders deliver.",
    image: commerceImage,
    alt: "A merchant taking a voice order at her vegetable stall",
  },
  {
    number: "02",
    title: "Transactions:",
    description:
      "Every order, payment, and delivery is recorded digitally for the first time.",
    image: transactionsImage,
    alt: "Digital transaction records on a merchant's phone",
  },
  {
    number: "03",
    title: "Data:",
    description:
      "A clear, unvarnished picture of what inventory sells, when, and to whom.",
    image: dataImage,
    alt: "A shopkeeper reviewing sales charts on a tablet",
  },
  {
    number: "04",
    title: "Trust:",
    description:
      "An immutable, verified track record proving a merchant consistently gets paid.",
    image: trustImage,
    alt: "A confirmed digital payment on a smartphone",
  },
  {
    number: "05",
    title: "Financial Services:",
    description: "Digital wallets and savings tools unlocked by history.",
    image: financeImage,
    alt: "A business owner managing her savings by phone",
  },
  {
    number: "06",
    title: "Credit:",
    description:
      "Fair, algorithmic lending and micro-capital for businesses banks rejected.",
    image: financeImage,
    alt: "A merchant reviewing business finances beside her cash and notebook",
  },
  {
    number: "07",
    title: "More Commerce:",
    description:
      "Injected capital fuels inventory expansion, feeding the loop.",
    image: growthImage,
    alt: "A merchant restocking her growing shop",
  },
];

export default function VisionSection() {
  return (
    <section className="vision-page" id="vision">
      <header className="section-heading vision-heading">
        <h2>
          One loop. <span>An economy-sized idea.</span>
        </h2>
        <p>
          Beez starts with commerce because it needs no history and no capital.
          <br />
          Everything else is built on top, in this order.
        </p>
      </header>

      <h3 className="flywheel-title">The 7-Step Compounding Flywheel Grid</h3>
      <div className="flywheel">
        <div className="flywheel-track" aria-hidden="true">
          {stages.map((stage) => (
            <i key={stage.number} />
          ))}
          <span>→</span>
        </div>
        <div className="stage-grid">
          {stages.map((stage) => (
            <article className="stage-card" key={stage.number}>
              <span className="stage-number">{stage.number}</span>
              <img className="stage-photo" src={stage.image} alt={stage.alt} loading="lazy" width={1088} height={608} />
              <h4>{stage.title}</h4>
              <p>{stage.description}</p>
            </article>
          ))}
        </div>
      </div>

      <PilotMapSection />
    </section>
  );
}
