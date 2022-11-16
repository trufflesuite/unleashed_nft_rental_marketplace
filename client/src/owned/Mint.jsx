import { useRef } from "react";
import { useMarketplace } from "../contexts/MarketplaceContext";

function Mint() {
  const { mint } = useMarketplace();
  const inputRef = useRef(null);

  return (
    <div id="mint">
      <h1>Mint new NFT</h1>
      <input ref={inputRef} placeholder="ipfs://..." />
      <button onClick={() => void mint(inputRef.current.value)}>Mint</button>
    </div>
  );
}

export { Mint };
