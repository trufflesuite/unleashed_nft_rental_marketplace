require("@openzeppelin/test-helpers/configure")({
  provider: web3.currentProvider,
  singletons: {
    abstraction: "truffle",
  },
});

const { constants, expectRevert, expectEvent } = require('@openzeppelin/test-helpers');
const RentableNft = artifacts.require("RentableNft");

contract("RentableNft", function (accounts) {
  it("should support the ERC721 and ERC4907 standards", async () => {
    const rentableNft = await RentableNft.deployed();
    const ERC721InterfaceId = "0x80ac58cd";
    const ERC4907InterfaceId = "0xad092b5c";
    var isERC721 = await rentableNft.supportsInterface(ERC721InterfaceId);
    var isER4907 = await rentableNft.supportsInterface(ERC4907InterfaceId); 
    assert.equal(isERC721, true, "RentableNft is not an ERC721");
    assert.equal(isER4907, true, "RentableNft is not an ERC4907");
  });
  it("should not set UserInfo if not the owner", async () => {
    const rentableNft = await RentableNft.deployed();
    const expirationDatePast = 1660252958; // Aug 8 2022
    await rentableNft.mint("fakeURI");
    // Failed require in function
    await expectRevert(rentableNft.setUser(1, accounts[1], expirationDatePast, {from: accounts[1]}), "ERC721: transfer caller is not owner nor approved");
    // Assert no UserInfo for NFT
    var user = await rentableNft.userOf.call(1);
    var date = await rentableNft.userExpires.call(1);
    assert.equal(user, constants.ZERO_ADDRESS, "NFT user is not zero address");
    assert.equal(date, 0, "NFT expiration date is not 0");
  });
  it("should return the correct UserInfo", async () => {
    const rentableNft = await RentableNft.deployed();
    const expirationDatePast = 1660252958; // Aug 8 2022
    const expirationDateFuture = 4121727755; // Aug 11 2100
    await rentableNft.mint("fakeURI");
    await rentableNft.mint("fakeURI");
    // Set and get UserInfo
    var expiredTx = await rentableNft.setUser(2, accounts[1], expirationDatePast)
    var unexpiredTx = await rentableNft.setUser(3, accounts[2], expirationDateFuture)
    var expiredNFTUser = await rentableNft.userOf.call(2);
    var expiredNFTDate = await rentableNft.userExpires.call(2);
    var unexpireNFTUser = await rentableNft.userOf.call(3);
    var unexpiredNFTDate = await rentableNft.userExpires.call(3);
    // Assert UserInfo and event transmission
    assert.equal(expiredNFTUser, constants.ZERO_ADDRESS, "Expired NFT has wrong user");
    assert.equal(expiredNFTDate, expirationDatePast, "Expired NFT has wrong expiration date");
    expectEvent(expiredTx, "UpdateUser", { tokenId: "2", user: accounts[1], expires: expirationDatePast.toString()});
    assert.equal(unexpireNFTUser, accounts[2], "Expired NFT has wrong user");
    assert.equal(unexpiredNFTDate, expirationDateFuture, "Expired NFT has wrong expiration date");
    expectEvent(unexpiredTx, "UpdateUser", { tokenId: "3", user: accounts[2], expires: expirationDateFuture.toString()});
    // Burn NFT
    unexpiredTx = await rentableNft.burn(3);
    // Assert UserInfo was deleted
    unexpireNFTUser = await rentableNft.userOf.call(3);
    unexpiredNFTDate = await rentableNft.userExpires.call(3);
    assert.equal(unexpireNFTUser, constants.ZERO_ADDRESS, "NFT user is not zero address");
    assert.equal(unexpiredNFTDate, 0, "NFT expiration date is not 0");
    expectEvent(unexpiredTx, "UpdateUser", { tokenId: "3", user: constants.ZERO_ADDRESS, expires: "0"});
  });
});