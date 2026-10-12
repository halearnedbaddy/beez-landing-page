import { APP_URL } from "./links";

export default function FinalCallToAction() {
  return (
<div className={"band"}>
  {"\n"}
  <h2>{"Be part of the first loop."}</h2>
  {"\n"}
  <a className={"btn big launch"} href={APP_URL} rel="noopener noreferrer">{"Launch app"}</a>
  {"\n"}
</div>
  );
}
