import { Mint } from "./Mint";
import { Cards } from "./Cards";

function Owned() {
  return (
    <div className="page" id="owned-page">
      <Mint />
      <Cards />
    </div>
  );
}

export { Owned };
