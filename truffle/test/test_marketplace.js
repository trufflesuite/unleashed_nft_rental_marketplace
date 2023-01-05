require("@openzeppelin/test-helpers/configure")({
  provider: web3.currentProvider,
  singletons: {
    abstraction: "truffle",
  },
});

const { balance, constants, ether, expectRevert, expectEvent } = require('@openzeppelin/test-helpers');
const Marketplace = artifacts.require("Marketplace");
const RentableNft = artifacts.require("RentableNft");

const TODAY = Math.floor(Date.now()/1000);
const TODAY_2 = TODAY + (60*60);
const YESTERDAY = TODAY - (24*60*60);
const TOMORROW = TODAY + (24*60*60);
const IN_FIVE_DAYS = TODAY + (24*60*60*5);

function assertListing(actual, expected) {
  assert.equal(actual.owner, expected.owner, "Owner is not correct");
  assert.equal(actual.user, expected.user, "User is not correct");
  assert.equal(actual.nftContract, expected.nftContract, "NFT contract is not correct");
  assert.equal(actual.tokenId, expected.tokenId, "TokenId is not correct");
  assert.equal(actual.pricePerDay, expected.pricePerDay, "Price per day is not correct");
  assert.equal(actual.startDateUNIX, expected.startDateUNIX, "Start date is not correct");
  assert.equal(actual.endDateUNIX, expected.endDateUNIX, "End date is not correct");
  assert.equal(actual.expires, expected.expires, "Expires date is not correct");
}

async function assertNFT(nftContractInstance, tokenId, expectedUser, expectedExpires) {
  let user = await nftContractInstance.userOf.call(tokenId);
  let expires = await nftContractInstance.userExpires.call(tokenId);
  assert.equal(user, expectedUser, "User is not correct");
  assert.equal(expires, expectedExpires, "Expires date is incorrect");
}

// EnumerableSet makes no guarantee about ordering, so we have to find the matching tokenId
function getListing(listings, tokenId) {
  let listing = {};
  listings.every((_listing) => {
    if (_listing.tokenId == tokenId) {
      listing = _listing;
      return false;
    } else {
      return true;
    }
  });
  return listing
}

function listingToString(listing) {
  let listingCopy = {...listing};
  listingCopy.tokenId = listing.tokenId.toString();
  listingCopy.pricePerDay = listing.pricePerDay.toString();
  listingCopy.startDateUNIX = listing.startDateUNIX.toString();
  listingCopy.endDateUNIX = listing.endDateUNIX.toString();
  listingCopy.expires = listing.expires.toString();
  if ("rentalFee" in listing) {
    listingCopy.rentalFee = listing.rentalFee.toString();
  }
}

contract("Marketplace", function (accounts) {
  const MARKETPLACE_OWNER = "0xA31618621805C9215B5Ade58EB09dBA8f32Bbdb8";
  const TOKEN_OWNER = accounts[1];
  const USER = accounts[2];
  let marketplace;
  let rentableNft;
  let nftContract;
  let listingFee;
  let tokenID1;
  let tokenID2;
  let tokenID3;


  before('should reuse variables', async () => {
    marketplace = await Marketplace.at("0x8e3f5Bb333051B43078B579A86aBC6d6F1f66D2b");
    rentableNft = await RentableNft.at("0x2Ef8bfBe839a0CD5254f6D20C865025c1Bbb58EA");
    nftContract = rentableNft.address;
    listingFee = (await marketplace.getListingFee()).toString();
    // mint nfts for testing
    tokenID1 = (await rentableNft.mint("fakeURI", {from: TOKEN_OWNER})).logs[0].args.tokenId.toNumber();
    tokenID2 = (await rentableNft.mint("fakeURI", {from: TOKEN_OWNER})).logs[0].args.tokenId.toNumber();
    tokenID3 = (await rentableNft.mint("fakeURI", {from: TOKEN_OWNER})).logs[0].args.tokenId.toNumber();
  });
  it("should list nfts", async function () {
    let tracker = await balance.tracker(MARKETPLACE_OWNER);
    await tracker.get();
    let txn = await marketplace.listNFT(nftContract, tokenID1, ether("1"), TOMORROW, IN_FIVE_DAYS, {from: TOKEN_OWNER, value: listingFee});
    assert.equal(await tracker.delta(), listingFee, "Listing fee not transferred");
    let expectedListing = {
      owner: TOKEN_OWNER,
      user: constants.ZERO_ADDRESS,
      nftContract: nftContract,
      tokenId: tokenID1,
      pricePerDay: ether("1"),
      startDateUNIX: TOMORROW,
      endDateUNIX: IN_FIVE_DAYS,
      expires: 0
    };
    assertListing(getListing(await marketplace.getAllListings.call(), tokenID1), expectedListing);
    expectEvent(txn, "NFTListed", listingToString(expectedListing));
    await tracker.get();
    txn = await marketplace.listNFT(nftContract, tokenID2, ether(".5"), TOMORROW, IN_FIVE_DAYS, {from: TOKEN_OWNER, value: listingFee});
    assert.equal(await tracker.delta(), listingFee, "Listing fee not transferred");
    expectedListing.tokenId = tokenID2;
    expectedListing.pricePerDay = ether(".5");
    expectedListing.startDateUNIX = TOMORROW;
    expectedListing.endDateUNIX = IN_FIVE_DAYS;
    expectedListing.expires = 0;
    assertListing(getListing(await marketplace.getAllListings.call(), tokenID2), expectedListing);
    expectEvent(txn, "NFTListed", listingToString(expectedListing));
  });
  it("should validate listings", async function () {
    await expectRevert(
      marketplace.listNFT(marketplace.address, tokenID1, 1, TOMORROW, IN_FIVE_DAYS, {from: TOKEN_OWNER, value: listingFee}),
      "Contract is not an ERC4907"
    );
    await expectRevert(
      marketplace.listNFT(nftContract, tokenID1, 1, TOMORROW, IN_FIVE_DAYS, {from: accounts[2], value: listingFee}),
      "Not owner of nft"
    );
    await expectRevert(
      marketplace.listNFT(nftContract, tokenID1, 1, TOMORROW, IN_FIVE_DAYS, {from: TOKEN_OWNER}),
      "Not enough ether for listing fee"
    );
    await expectRevert(
      marketplace.listNFT(nftContract, tokenID1, 0, TOMORROW, IN_FIVE_DAYS, {from: TOKEN_OWNER, value: listingFee}),
      "Rental price should be greater than 0"
    );
    await expectRevert(
      marketplace.listNFT(nftContract, tokenID1, 1, YESTERDAY, IN_FIVE_DAYS, {from: TOKEN_OWNER, value: listingFee}),
      "Start date cannot be in the past"
    );
    await expectRevert(
      marketplace.listNFT(nftContract, tokenID1, 1, IN_FIVE_DAYS, YESTERDAY, {from: TOKEN_OWNER, value: listingFee}),
      "End date cannot be before the start date"
    );
    await expectRevert(
      marketplace.listNFT(nftContract, tokenID1, 1, TOMORROW, IN_FIVE_DAYS, {from: TOKEN_OWNER, value: listingFee}),
      "This NFT has already been listed"
    );
  });
  it("should modify listings and nft contract when nft is rented", async function () {
    assertNFT(rentableNft, tokenID1, constants.ZERO_ADDRESS, 0);
    assertNFT(rentableNft, tokenID2, constants.ZERO_ADDRESS, 0);
    let tracker = await balance.tracker(TOKEN_OWNER);
    await tracker.get();
    let txn = await marketplace.rentNFT(nftContract, tokenID1, TODAY_2, {from: USER, value: ether("1")});
    // 1 day rental, pricePerDay is 1
    assert.equal((await tracker.delta()).toString(), ether("1").toString(), "One day rental fee is not correct");
    let listing = getListing(await marketplace.getAllListings.call(), tokenID1);
    let expectedListing = {
      owner: TOKEN_OWNER,
      user: USER,
      nftContract: nftContract,
      tokenId: tokenID1,
      pricePerDay: ether("1"),
      startDateUNIX: TOMORROW,
      endDateUNIX: IN_FIVE_DAYS,
      expires: TODAY_2,
      rentalFee: 1
    };
    assertListing(listing, expectedListing);
    assertNFT(rentableNft, tokenID1, USER, TODAY_2);
    expectEvent(txn, "NFTRented", listingToString(expectedListing));
    await tracker.get();
    txn = await marketplace.rentNFT(nftContract, tokenID2, IN_FIVE_DAYS, {from: USER, value: ether("2.5")});
    assert.equal((await tracker.delta()).toString(), ether("2.5").toString(), "Five day rental fee is not correct");
    listing = getListing(await marketplace.getAllListings.call(), tokenID2);
    expectedListing.tokenId = tokenID2;
    expectedListing.pricePerDay = ether(".5");
    expectedListing.expires = IN_FIVE_DAYS;
    expectedListing.rentalFee = ether("2.5");
    assertListing(listing, expectedListing);
    assertNFT(rentableNft, tokenID2, USER, IN_FIVE_DAYS);
    expectEvent(txn, "NFTRented", listingToString(expectedListing));
  });
  it("should validate rentals", async function () {
    await expectRevert(
      marketplace.rentNFT(nftContract, tokenID1, TODAY_2, {from: USER, value: ether("1")}),
      "NFT already rented"
    );
    await marketplace.listNFT(nftContract, tokenID3, ether("1"), TOMORROW, IN_FIVE_DAYS, {from: TOKEN_OWNER, value: listingFee});
    await expectRevert(
      marketplace.rentNFT(nftContract, tokenID3, IN_FIVE_DAYS + 1000, {from: USER, value: ether("2.5")}),
      "Rental period exceeds max date rentable"
    );
    await expectRevert(
      marketplace.rentNFT(nftContract, tokenID3, TOMORROW, {from: USER}),
      "Not enough ether to cover rental period"
    );
  });
  it("should validate unlisting", async function () {
    await expectRevert(
      marketplace.unlistNFT(nftContract, 10000, {from: TOKEN_OWNER, value: ether("2.5")}),
      "This NFT is not listed"
    );
    await expectRevert(
      marketplace.unlistNFT(nftContract, tokenID2, {from: USER, value: ether("2.5")}),
      "Not approved to unlist NFT"
    );
    await expectRevert(
      marketplace.unlistNFT(nftContract, tokenID2, {from: TOKEN_OWNER}),
      "Not enough ether to cover refund"
    );
  });
  it("should refund USER and cleanup listings if unlisted", async function () {
    let tracker = await balance.tracker(USER);
    await tracker.get();
    let txn = await marketplace.unlistNFT(nftContract, tokenID2, {from: TOKEN_OWNER, value: ether("2.5")});
    assert.equal((await tracker.delta()).toString(), ether("2.5"), "Refunded amount is not correct");
    let listing = getListing(await marketplace.getAllListings.call(), tokenID2);
    assert.equal(Object.keys(listing).length, 0, "NFT was not unlisted");
    assertNFT(rentableNft, tokenID2, constants.ZERO_ADDRESS, 0);
    expectEvent(txn, "NFTUnlisted", {
      unlistSender: TOKEN_OWNER,
      nftContract: nftContract,
      tokenId: tokenID2.toString(),
      refund: ether("2.5")
    });
  });
});