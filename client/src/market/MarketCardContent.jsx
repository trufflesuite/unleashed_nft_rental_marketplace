import { useEffect, useState, useRef, useCallback } from "react";
import { useTime } from "../contexts/TimeContext";
import { Card } from "../card";
import { CANT_RENT_REASONS, getReadableTime } from "../utils";

const PROGRESS_MAX = 100;
const INPUT_MAX = 10000;

function MarketCardContent({ data }) {
  const {
    nftContractAddress,
    tokenId,
    tokenUri,
    startDateUnix,
    endDateUnix,
    duration,
    expires,
    pricePerDay,
    owner,
    isOwner,
    user,
    isUser
  } = data;
  const [progress, setProgress] = useState(0);
  const [readableProgress, setReadableProgress] = useState("");
  const [canRent, setCanRent] = useState(false);
  const [cantRentReason, setCantRentReason] = useState(false);
  const [rentDuration, setRentDuration] = useState(0);
  const [readableRentDuration, setReadableRentDuration] = useState("");
  const now = useTime();
  const inputRef = useRef(null);

  const updateRentDuration = useCallback(() => {
    const timeLeft = endDateUnix - now;
    const newRentDurationPercent = parseInt(inputRef.current.value) / INPUT_MAX;
    const newRentDuration = Math.floor(newRentDurationPercent * timeLeft);
    if (newRentDuration !== rentDuration) {
      setRentDuration(newRentDuration);
      setReadableRentDuration(getReadableTime(newRentDuration, 1));
    }
  }, [now, endDateUnix, rentDuration]);

  useEffect(() => {
    const elapsed = now - startDateUnix;
    const timeLeft = endDateUnix - now;

    const newProgress = Math.floor(elapsed / duration * PROGRESS_MAX);
    if (newProgress !== progress) setProgress(newProgress);

    const newReadableProgress = getReadableTime(timeLeft);
    if (newReadableProgress !== readableProgress) setReadableProgress(newReadableProgress);

    const listingExpired = now >= endDateUnix;
    const rentExpired = now >= expires;
    let newCantRentReason;
    let newCanRent = false;

    if (listingExpired) {
      newCantRentReason = CANT_RENT_REASONS.LISTING_EXPIRED;
    } else if (isOwner) {
      newCantRentReason = CANT_RENT_REASONS.YOU_ARE_OWNER;
    } else if (!rentExpired) {
      newCantRentReason = isUser ?
        CANT_RENT_REASONS.YOU_ARE_RENTING
        :
        CANT_RENT_REASONS.SOMEONE_ELSE_IS_RENTING;
    } else {
      newCanRent = true;
    }
    if (newCanRent !== canRent) setCanRent(newCanRent);
    if (newCantRentReason !== cantRentReason) setCantRentReason(newCantRentReason);

    updateRentDuration();
  }, [
    now,
    startDateUnix,
    endDateUnix,
    duration,
    expires,
    isOwner,
    isUser,
    progress,
    readableProgress,
    canRent,
    cantRentReason,
    updateRentDuration
  ]);

  return (
    <>
      <Card.Progress
        max={PROGRESS_MAX}
        value={progress}
        readableValue={`${readableProgress} left to rent`}
      />
      <Card.Table>
        <Card.Table.Cell name="Owner" value={owner} valueTrim={{ leftSize: 8, rightSize: 6 }} />
        <Card.Table.Cell name="User" value={user} valueTrim={{ leftSize: 8, rightSize: 6 }} />
        <Card.Table.Cell name="NFT contract address" value={nftContractAddress} valueTrim={{ leftSize: 8, rightSize: 6 }} />
        <Card.Table.Cell name="Token ID" value={tokenId} />
        <Card.Table.Cell name="Token URI" value={tokenUri} valueTrim={{ leftSize: 11, rightSize: 6 }} />
      </Card.Table>
      <Card.Price value={pricePerDay} />
      <Card.Rent
        canRent={canRent}
        cantRentReason={cantRentReason}
        nftContractAddress={nftContractAddress}
        tokenId={tokenId}
        inputRef={inputRef}
        inputMax={INPUT_MAX}
        rentDuration={rentDuration}
        readableRentDuration={readableRentDuration}
        updateRentDuration={updateRentDuration}
      />
    </>
  );
}

export { MarketCardContent };
