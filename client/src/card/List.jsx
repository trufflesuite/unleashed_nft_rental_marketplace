import { useState } from "react";
import { trim } from "../utils";
import { useEth } from "../contexts/EthContext";
import { useMarketplace } from "../contexts/MarketplaceContext";

const TIME_UNIT_VALUES = {
  HOURS: 1,
  DAYS: 24,
  MONTHS: 24 * 30
};
const ETHER_UNIT_VALUES = {
  WEI: "wei",
  GWEI: "gwei",
  ETHER: "ether"
};

const isNumber = /^\d*\.?\d*$/;

function List({
  listed,
  rented,
  nftContractAddress,
  tokenId,
  user
}) {
  const { state: { web3 } } = useEth();
  const { list, unlist } = useMarketplace();
  const [duration, setDuration] = useState("");
  const [price, setPrice] = useState("");
  const [timeUnit, setTimeUnit] = useState(TIME_UNIT_VALUES.DAYS);
  const [etherUnit, setEtherUnit] = useState(ETHER_UNIT_VALUES.GWEI);
  const onDurationInputChange = e => {
    if (isNumber.test(e.target.value)) setDuration(e.target.value);
  };
  const onPriceInputChange = e => {
    if (isNumber.test(e.target.value)) setPrice(e.target.value);
  };

  const onTimeUnitChange = e => {
    // Potentially inaccurate
    const newDuration = parseFloat(duration || 0) / parseFloat(e.target.value) * timeUnit;
    setDuration(newDuration.toString());
    setTimeUnit(e.target.value);
  };
  const onEtherUnitChange = e => {
    const priceInWei = web3.utils.toWei(price || "0", etherUnit);
    const priceInNewUnit = web3.utils.fromWei(priceInWei, e.target.value);
    setPrice(priceInNewUnit);
    setEtherUnit(e.target.value);
  };

  const onListButtonClick = () => void list(
    nftContractAddress,
    tokenId,
    web3.utils.toWei(price, etherUnit),
    duration * timeUnit * 60 * 60
  );
  const onUnlistButtonClick = () => void unlist(
    nftContractAddress,
    tokenId
  );

  if (listed) {
    return (
      <div className="unlist-container">
        <h3>
          {!user ?
            ""
            : parseInt(user) === 0 || !rented ?
              "Awaiting renter"
              :
              `Rented by ${trim(user, 8, 6)}`
          }
        </h3>
        <button onClick={onUnlistButtonClick}>
          Unlist
        </button>
      </div>
    );
  } else {
    return (
      <div className="list-container">

        <div className="form">
          <input
            value={duration}
            onChange={onDurationInputChange}
            placeholder="Duration"
            type="text"
          />
          <select value={timeUnit} onChange={onTimeUnitChange}>
            <option value={TIME_UNIT_VALUES.HOURS}>hours</option>
            <option value={TIME_UNIT_VALUES.DAYS}>days</option>
            <option value={TIME_UNIT_VALUES.MONTHS}>months</option>
          </select>
        </div>

        <div className="form">
          <input
            value={price}
            onChange={onPriceInputChange}
            placeholder="Price"
            type="text"
          />
          <select value={etherUnit} onChange={onEtherUnitChange}>
            <option value={ETHER_UNIT_VALUES.WEI}>wei</option>
            <option value={ETHER_UNIT_VALUES.GWEI}>gwei</option>
            <option value={ETHER_UNIT_VALUES.ETHER}>ether</option>
          </select>
        </div>

        <button onClick={onListButtonClick} disabled={!duration || !price}>
          List
        </button>
      </div>
    );
  }
}

export { List };
