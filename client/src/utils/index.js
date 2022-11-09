export const CANT_RENT_REASONS = {
  LISTING_EXPIRED: 0,
  YOU_ARE_OWNER: 1,
  YOU_ARE_RENTING: 2,
  SOMEONE_ELSE_IS_RENTING: 3,
};

// TODO: Use infura ipfs gateway
export const IPFS_GATEWAY = "https://rental-marketplace.infura-ipfs.io";

export function isIpfsUri(uri) {
  return uri.match(/^ipfs:\/\//);
}

export function getIpfsGatewayUri(uri) {
  const ipfsAddress = uri.replace(/^ipfs:\/\//i, "");
  return `${IPFS_GATEWAY}${ipfsAddress}`;
}

export function roundNum(num, decimals = 0) {
  return num.toLocaleString("en-US", { maximumFractionDigits: decimals });
}

export function getReadableTime(numSeconds, decimals = 0) {
  if (numSeconds < 100) {
    return `${numSeconds} second${numSeconds > 1 ? "s" : ""}`;
  }
  const numMinutes = numSeconds / 60;
  if (numMinutes < 60) {
    const numMinutesRounded = roundNum(numMinutes, decimals);
    return `${numMinutesRounded} minute${numMinutesRounded > 1 ? "s" : ""}`;
  }
  const numHours = numMinutes / 60;
  if (numHours < 24) {
    const numHoursRounded = roundNum(numHours, decimals);
    return `${numHoursRounded} hour${numHoursRounded > 1 ? "s" : ""}`;
  }
  const numDays = numHours / 24;
  const numDaysRounded = roundNum(numDays, decimals);
  return `${numDaysRounded} day${numDaysRounded > 1 ? "s" : ""}`;
}

export function trim(str, leftSize, rightSize, ellipsisLen = 3) {
  if (!rightSize) rightSize = leftSize;
  if (str.length <= leftSize + rightSize + ellipsisLen) {
    return str;
  } else {
    return str.slice(0, leftSize) +
      ".".repeat(ellipsisLen) +
      str.slice(-rightSize);
  }
}
