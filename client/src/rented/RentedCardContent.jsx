import { Card } from "../card";

function RentedCardContent({ data }) {
  const { owner, nftContractAddress, tokenId, tokenUriRes } = data;
  return (
    <>
      <Card.Table>
        <Card.Table.Cell name="Owner" value={owner} valueTrim={{ leftSize: 8, rightSize: 6 }} />
        <Card.Table.Cell name="NFT contract address" value={nftContractAddress} valueTrim={{ leftSize: 8, rightSize: 6 }} />
        <Card.Table.Cell name="Token ID" value={tokenId} />
        <Card.Table.Cell name="Media URI" value={tokenUriRes.animation_url || tokenUriRes.image} valueTrim={{ leftSize: 11, rightSize: 6 }} />
      </Card.Table>
    </>
  );
}

export { RentedCardContent };
