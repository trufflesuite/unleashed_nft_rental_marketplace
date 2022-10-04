import { useEffect, useState } from "react";
import { useMarketplace } from "../contexts/MarketplaceContext";
import { useTime } from "../contexts/TimeContext";
import { Card } from "../card";
import { RentedCardContent } from "./RentedCardContent";

function Rented() {
  const [filteredListings, setFilteredListings] = useState([]);
  const { listings } = useMarketplace();
  const now = useTime();

  useEffect(() => {
    const filtered = listings.filter(listing => listing.isUser && now < listing.expires);
    setFilteredListings(filtered);
  }, [now, listings]);

  const cards = filteredListings.map(listing => {
    const { nftContractAddress, tokenId } = listing;
    return (
      <Card
        data={listing}
        key={`rented-nft-${nftContractAddress}-${tokenId}`}
      >
        <RentedCardContent data={listing} />
      </Card>
    );
  });

  return (
    <div className="page" id="rented-page">
      <h1>My rented NFTs</h1>
      <div className="cards">
        {cards}
      </div>
    </div>
  );
}

export { Rented };
