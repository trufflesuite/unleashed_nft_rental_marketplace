import { useEffect, useState } from "react";
import { useTime } from "../contexts/TimeContext";
import { Card } from "../card";
import { getReadableTime } from "../utils";

const PROGRESS_MAX = 100;

function OwnedCardContent({ data }) {
  const { nftContractAddress, tokenId, tokenUriRes, listingData } = data;
  const now = useTime();
  const [listed, setListed] = useState(undefined);
  const [rented, setRented] = useState(undefined);
  const [progress, setProgress] = useState(0);
  const [readableProgress, setReadableProgress] = useState("");

  useEffect(() => {
    const getTokenStatus = () => {
      // const isListed = listingData && now < listingData.endDateUnix;
      // return !isListed
      return !listingData
        ? [false, false]
        : [true, now < listingData.expires];
    };

    const [newListed, newRented] = getTokenStatus();
    if (newListed !== listed) setListed(newListed);
    if (newRented !== rented) setRented(newRented);

    if (newListed) {
      const { startDateUnix, endDateUnix, duration } = listingData;
      const elapsed = now - startDateUnix;
      const timeLeft = endDateUnix - now;

      const newProgress = Math.floor(elapsed / duration * PROGRESS_MAX);
      if (newProgress !== progress) setProgress(newProgress);

      const newReadableProgress = getReadableTime(timeLeft);
      if (newReadableProgress !== readableProgress) setReadableProgress(newReadableProgress);
    }
  }, [now, listingData, rented, listed, progress, readableProgress]);

  return (
    <>
      <Card.Progress
        max={PROGRESS_MAX}
        value={listed ? progress : 100}
        readableValue={listed ? `${readableProgress} left on market` : "?"}
      />
      <Card.Table>
        <Card.Table.Cell name="User" value={listingData?.user} valueTrim={{ leftSize: 8, rightSize: 6 }} />
        <Card.Table.Cell name="NFT contract address" value={nftContractAddress} valueTrim={{ leftSize: 8, rightSize: 6 }} />
        <Card.Table.Cell name="Token ID" value={tokenId} />
        <Card.Table.Cell name="Media URI" value={tokenUriRes.animation_url || tokenUriRes.image} valueTrim={{ leftSize: 11, rightSize: 6 }} />
      </Card.Table>
      <Card.List
        listed={listed}
        rented={rented}
        nftContractAddress={nftContractAddress}
        tokenId={tokenId}
        user={listingData?.user}
      />
    </>
  );
}

export { OwnedCardContent };
