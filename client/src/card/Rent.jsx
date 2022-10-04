import { useMarketplace } from "../contexts/MarketplaceContext";
import { CANT_RENT_REASONS } from "../utils";

function Rent({
  canRent,
  cantRentReason,
  nftContractAddress,
  tokenId,
  inputRef,
  inputMax,
  rentDuration,
  readableRentDuration,
  updateRentDuration
}) {
  const { rent } = useMarketplace();

  return (
    <div className="rent-container">
      <h3>Duration: {readableRentDuration}</h3>
      <input
        ref={inputRef}
        type="range"
        min="0"
        max={inputMax}
        defaultValue="0"
        onChange={updateRentDuration}
        disabled={!canRent}
      />
      <button
        onClick={() => rent(nftContractAddress, tokenId, rentDuration)}
        disabled={!canRent}
      >
        {cantRentReason === CANT_RENT_REASONS.LISTING_EXPIRED ? "Listing expired"
          : cantRentReason === CANT_RENT_REASONS.YOU_ARE_OWNER ? "You are the owner"
            : cantRentReason === CANT_RENT_REASONS.YOU_ARE_RENTING ? "You are already renting"
              : cantRentReason === CANT_RENT_REASONS.SOMEONE_ELSE_IS_RENTING ? "Someone else is renting"
                : "Rent"}
      </button>
    </div>
  );
}

export { Rent };
