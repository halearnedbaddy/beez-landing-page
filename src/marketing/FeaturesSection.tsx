import { useState } from "react";
import TrustSection from "./TrustSection";
import BuiltOnSection from "./BuiltOnSection";
import shopPageImg from "@/assets/features/shop-page.jpg";
import voiceProductsImg from "@/assets/features/voice-products.jpg";
import shopVideoImg from "@/assets/features/shop-video.jpg";
import orderingImg from "@/assets/features/ordering.jpg";
import mpesaImg from "@/assets/features/mpesa.jpg";
import alertsImg from "@/assets/features/alerts.jpg";
import deliveryImg from "@/assets/features/delivery.jpg";
import recordsImg from "@/assets/features/records.jpg";

export default function FeaturesSection() {
  const [activeTab, setActiveTab] = useState(0);

  return (
<>
<section id={"features"} className={"features-page"}>
  {"\n"}
  <header className={"section-heading features-heading"}>
    <h2>{"Everything a street vendor needs to sell."}</h2>
    <p>{"Eight features, one simple flow, from the first product to the final delivery. Tap a step to see how it works."}</p>
  </header>
  {"\n"}
  <div className={"tabs"} role={"tablist"}>
    <button className={"tab"} role={"tab"} id={"tab0"} aria-controls={"tp0"} aria-selected={activeTab === 0} onClick={() => setActiveTab(0)} type="button">{"1. Shop page"}</button>
    <button className={"tab"} role={"tab"} id={"tab1"} aria-controls={"tp1"} aria-selected={activeTab === 1} onClick={() => setActiveTab(1)} type="button">{"2. Voice products"}</button>
    <button className={"tab"} role={"tab"} id={"tab2"} aria-controls={"tp2"} aria-selected={activeTab === 2} onClick={() => setActiveTab(2)} type="button">{"3. Shop video"}</button>
    <button className={"tab"} role={"tab"} id={"tab3"} aria-controls={"tp3"} aria-selected={activeTab === 3} onClick={() => setActiveTab(3)} type="button">{"4. Ordering"}</button>
    <button className={"tab"} role={"tab"} id={"tab4"} aria-controls={"tp4"} aria-selected={activeTab === 4} onClick={() => setActiveTab(4)} type="button">{"5. M-Pesa"}</button>
    <button className={"tab"} role={"tab"} id={"tab5"} aria-controls={"tp5"} aria-selected={activeTab === 5} onClick={() => setActiveTab(5)} type="button">{"6. Alerts"}</button>
    <button className={"tab"} role={"tab"} id={"tab6"} aria-controls={"tp6"} aria-selected={activeTab === 6} onClick={() => setActiveTab(6)} type="button">{"7. Delivery"}</button>
    <button className={"tab"} role={"tab"} id={"tab7"} aria-controls={"tp7"} aria-selected={activeTab === 7} onClick={() => setActiveTab(7)} type="button">{"8. Records"}</button>
  </div>
  {"\n"}
  <div className={"tp"} role={"tabpanel"} id={"tp0"} aria-labelledby={"tab0"} hidden={activeTab !== 0}>
    <div>
      <h3>{"Your shop page in minutes"}</h3>
      <p>{"Sign up with your phone number and get a shop page of your own, with a link you can share anywhere."}</p>
      <ul className={"ck"}>
        <li>{"Login with a phone number and a text-message code"}</li>
        <li>{"Shop name, category, short description and location"}</li>
        <li>{"A shareable link customers can open on any phone"}</li>
      </ul>
    </div>
    <div className={"pimg"}>
      <img src={shopPageImg} alt={"A vendor holding up her phone with her own shop page"} width={736} height={912} loading="lazy" />
    </div>
  </div>
  <div className={"tp"} role={"tabpanel"} id={"tp1"} aria-labelledby={"tab1"} hidden={activeTab !== 1}>
    <div>
      <h3>{"Add products by voice"}</h3>
      <p>{"Just say what you sell and what it costs. Beez turns your words into a product list, with no forms to fill in. Prefer to type? You can do that too."}</p>
      <ul className={"ck"}>
        <li>{"Speak in English or Swahili, for example \"dresses 1,500, jeans 2,000\""}</li>
        <li>{"Review what Beez understood and fix it before it goes live"}</li>
        <li>{"Add or edit products by hand any time"}</li>
      </ul>
    </div>
    <div className={"pimg"}>
      <img src={voiceProductsImg} alt={"A vendor speaking to his phone while a product list appears"} width={736} height={912} loading="lazy" />
    </div>
  </div>
  <div className={"tp"} role={"tabpanel"} id={"tp2"} aria-labelledby={"tab2"} hidden={activeTab !== 2}>
    <div>
      <h3>{"A short video of your shop"}</h3>
      <p>{"Let customers see who you are. Record one 15 to 30 second video of your shop, stall or products."}</p>
      <ul className={"ck"}>
        <li>{"Recorded right inside the app"}</li>
        <li>{"Compressed to save your customers' mobile data"}</li>
        <li>{"Optional photos for each product"}</li>
      </ul>
    </div>
    <div className={"pimg"}>
      <img src={shopVideoImg} alt={"A shop owner recording a short video of her clothing stall"} width={736} height={912} loading="lazy" />
    </div>
  </div>
  <div className={"tp"} role={"tabpanel"} id={"tp3"} aria-labelledby={"tab3"} hidden={activeTab !== 3}>
    <div>
      <h3>{"Customers order without an app"}</h3>
      <p>{"Customers open your link, browse your products and place an order. Nothing to download and no account to create."}</p>
      <ul className={"ck"}>
        <li>{"Product list and video on one simple page"}</li>
        <li>{"Pick items, enter name and phone number"}</li>
        <li>{"Drop a pin on the map and add a landmark for delivery"}</li>
      </ul>
    </div>
    <div className={"pimg"}>
      <img src={orderingImg} alt={"A customer browsing products and ordering on her phone"} width={736} height={912} loading="lazy" />
    </div>
  </div>
  <div className={"tp"} role={"tabpanel"} id={"tp4"} aria-labelledby={"tab4"} hidden={activeTab !== 4}>
    <div>
      <h3>{"Pay with M-Pesa"}</h3>
      <p>{"The customer approves the payment on their own phone. An order counts only once the payment is confirmed."}</p>
      <ul className={"ck"}>
        <li>{"A payment request goes straight to the customer's phone"}</li>
        <li>{"Prices and totals are calculated securely by Beez"}</li>
        <li>{"Every payment is recorded and can be traced"}</li>
      </ul>
    </div>
    <div className={"pimg"}>
      <img src={mpesaImg} alt={"A customer approving a mobile money payment on their phone"} width={736} height={912} loading="lazy" />
    </div>
  </div>
  <div className={"tp"} role={"tabpanel"} id={"tp5"} aria-labelledby={"tab5"} hidden={activeTab !== 5}>
    <div>
      <h3>{"Instant order alerts"}</h3>
      <p>{"The moment a paid order arrives, you know about it, even when the app is closed."}</p>
      <ul className={"ck"}>
        <li>{"Push notification with the order details"}</li>
        <li>{"Text message backup if you have not seen it"}</li>
        <li>{"Accept the order or mark it ready in one tap"}</li>
      </ul>
    </div>
    <div className={"pimg"}>
      <img src={alertsImg} alt={"A vendor receiving instant order notifications on her phone"} width={736} height={912} loading="lazy" />
    </div>
  </div>
  <div className={"tp"} role={"tabpanel"} id={"tp6"} aria-labelledby={"tab6"} hidden={activeTab !== 6}>
    <div>
      <h3>{"Delivery by local riders"}</h3>
      <p>{"Nearby riders get the job, pick up from you and bring the order to the customer's pin."}</p>
      <ul className={"ck"}>
        <li>{"Approved riders switch themselves on when they are free"}</li>
        <li>{"The first rider to accept takes the job"}</li>
        <li>{"A 4-digit delivery code confirms the right person got the order"}</li>
        <li>{"Customers can follow their order's status"}</li>
      </ul>
    </div>
    <div className={"pimg"}>
      <img src={deliveryImg} alt={"A delivery rider on a motorbike carrying an order through the city"} width={736} height={912} loading="lazy" />
    </div>
  </div>
  <div className={"tp"} role={"tabpanel"} id={"tp7"} aria-labelledby={"tab7"} hidden={activeTab !== 7}>
    <div>
      <h3>{"A verified record of every sale"}</h3>
      <p>{"Every order, payment and delivery is saved. For the first time, your business has a history you can prove."}</p>
      <ul className={"ck"}>
        <li>{"See what sold and what you earned"}</li>
        <li>{"Builds the trust record that can lead to fair credit"}</li>
      </ul>
    </div>
    <div className={"pimg"}>
      <img src={recordsImg} alt={"A vendor reviewing her sales record on her phone"} width={736} height={912} loading="lazy" />
    </div>
  </div>
  {"\n"}
</section>
<TrustSection />
<BuiltOnSection />
</>
  );
}
