import { useMarketplace } from "../contexts/MarketplaceContext";
import { Card } from "../card";
import { OwnedCardContent } from "./OwnedCardContent";

function Cards() {
  const { ownedTokens } = useMarketplace();

  const cards = ownedTokens.map(userToken =>
    <Card
      data={userToken}
      key={`owned-nft-${userToken.nftContractAddress}-${userToken.tokenId}`}
    >
      <OwnedCardContent data={userToken} />
    </Card>
  );

  return (
    <>
      <h1>My owned NFTs</h1>
      <div className="cards">
        {cards}
      </div>
    </>
  );
}

export { Cards };
