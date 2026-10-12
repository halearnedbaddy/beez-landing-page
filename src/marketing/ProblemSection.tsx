export default function ProblemSection() {
  return (
<section className={"merchant-problem"} id={"problem"}>
  {"\n"}
  <h2 className={"problem-statement"}>
    {"Small merchants don't struggle because they lack drive. They struggle because every tool was built for a "}
    <em>{"bigger business"}</em>
    {"."}
  </h2>
  {"\n"}
  <div className={"problem-grid"}>
    <div className={"pcard"}>
      <span className={"problem-status"}>{"RECORDED"}</span>
      <div className={"ico"}>
        <svg viewBox={"0 0 64 64"} aria-hidden={"true"}>
          <path className={"fy"} d={"M8 26 L32 12 L56 26 Z"}></path>
          <path d={"M14 30 V46 M26 30 V46 M38 30 V46 M50 30 V46 M8 52 H56"}></path>
          <circle className={"fy"} cx={"52"} cy={"12"} r={"9"}></circle>
          <path d={"M47 7 L57 17 M57 7 L47 17"}></path>
        </svg>
      </div>
      <small>{"THE PROBLEM"}</small>
      <h3>{"Banks say no."}</h3>
      <p className={"why"}>{"No record, so there is nothing for a bank to evaluate, however reliable the business is."}</p>
      <div className={"ans"}>
        <small>{"WITH BEEZ"}</small>
        <p>{"Every sale and payment is recorded, building a history that banks can read."}</p>
      </div>
    </div>
    <div className={"pcard"}>
      <span className={"problem-status"}>{"SECURED"}</span>
      <div className={"ico"}>
        <svg viewBox={"0 0 64 64"} aria-hidden={"true"}>
          <rect className={"fy"} x={"14"} y={"8"} width={"36"} height={"48"} rx={"5"}></rect>
          <path d={"M22 20 H42 M22 30 H42 M22 40 H34"} strokeDasharray={"3 4"}></path>
        </svg>
      </div>
      <small>{"THE PROBLEM"}</small>
      <h3>{"Credit goes unrecorded."}</h3>
      <p className={"why"}>{"Customers buy on credit, and no system tracks who owes what."}</p>
      <div className={"ans"}>
        <small>{"WITH BEEZ"}</small>
        <p>{"Customers pay up front with M-Pesa, and every order is logged."}</p>
      </div>
    </div>
    <div className={"pcard"}>
      <span className={"problem-status"}>{"SEPARATED"}</span>
      <div className={"ico"}>
        <svg viewBox={"0 0 64 64"} aria-hidden={"true"}>
          <circle className={"fy"} cx={"26"} cy={"32"} r={"16"}></circle>
          <circle className={"fy"} cx={"40"} cy={"32"} r={"16"}></circle>
        </svg>
      </div>
      <small>{"THE PROBLEM"}</small>
      <h3>{"Business money and household money are one pile."}</h3>
      <p className={"why"}>{"So nobody can tell a good week from a bad one until it is too late."}</p>
      <div className={"ans"}>
        <small>{"WITH BEEZ"}</small>
        <p>{"Every sale is counted on its own, so you can see what the shop really earned."}</p>
      </div>
    </div>
  </div>
  {"\n"}
  <p className={"section-target"}>
    {"The target: every informal merchant, counted."}
  </p>
  {"\n"}
</section>
  );
}
