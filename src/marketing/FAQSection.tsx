export default function FAQSection() {
  return (
<section id={"faq"}>
  {"\n"}
  <h2>{"Questions, answered."}</h2>
  {"\n"}
  <p className={"sub"}>{"The basics, in plain words."}</p>
  {"\n"}
  <div className={"faq"}>
    {"\n"}
    <details>
      <summary>{"What is Beez?"}</summary>
      <p>{"Beez gives street vendors and small shops a shop page, orders, M-Pesa payments and delivery, all from a phone. Every sale is recorded, building a history that can lead to fair credit over time."}</p>
    </details>
    {"\n"}
    <details>
      <summary>{"Do customers need an app or an account?"}</summary>
      <p>{"No. Customers open the merchant's link in their browser, order, and pay with M-Pesa."}</p>
    </details>
    {"\n"}
    <details>
      <summary>{"Can I use Beez if I cannot read or write?"}</summary>
      <p>{"Yes, that is who we are building for. You add products by speaking, so typing is optional. We are designing Beez to read back what it understood and to use pictures and numbers instead of long text, so you can check everything by listening."}</p>
    </details>
    {"\n"}
    <details>
      <summary>{"How do I add my products?"}</summary>
      <p>{"Just say what you sell and the price. Beez turns it into a product list, and you check it before it goes live. You can also add or edit products by hand."}</p>
    </details>
    {"\n"}
    <details>
      <summary>{"How do payments work?"}</summary>
      <p>{"The customer gets an M-Pesa request on their phone and approves it. The order is passed to the merchant only after the payment is confirmed."}</p>
    </details>
    {"\n"}
    <details>
      <summary>{"What does it cost?"}</summary>
      <p>{"Pricing for the pilot is still being finalised with our first merchants. The plan is a small flat fee for merchants and no extra fees for customers at launch."}</p>
    </details>
    {"\n"}
    <details>
      <summary>{"Which languages does it support?"}</summary>
      <p>{"English and Swahili at launch. Beez is built to grow into more languages, local, national and international, so every merchant can speak the way they already speak."}</p>
    </details>
    {"\n"}
    <details>
      <summary>{"Where is Beez available?"}</summary>
      <p>{"We are starting with a pilot in Mombasa, Kenya."}</p>
    </details>
    {"\n"}
    <details>
      <summary>{"How do riders join?"}</summary>
      <p>{"Riders sign up in the app and are approved by the Beez team before they can take jobs."}</p>
    </details>
    {"\n"}
  </div>
  {"\n"}
</section>
  );
}
