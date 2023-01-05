const RentableNft = artifacts.require("RentableNft");
const Marketplace = artifacts.require("Marketplace");
const TODAY = Math.floor(Date.now()/1000) + (60*60);
const TOMORROW = TODAY + (24*60*60);
const PRICE = 1;
const START = TODAY;
const END = TOMORROW;
const EXPIRES = TOMORROW;
const ERC721_ABI = [
  {
      "inputs": [{"internalType": "address", "name": "to", "type": "address"}, {
      "internalType": "uint256",
      "name": "tokenId",
      "type": "uint256"
      }], "name": "approve", "outputs": [], "stateMutability": "nonpayable", "type": "function"
  },
  {
      "inputs": [{"internalType": "uint256", "name": "tokenId", "type": "uint256"}],
      "name": "ownerOf",
      "outputs": [{"internalType": "address", "name": "owner", "type": "address"}],
      "stateMutability": "view",
      "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "tokenId",
        "type": "uint256"
      }
    ],
    "name": "userExpires",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "stateMutability": "view",
    "type": "function",
    "constant": true
  }
];
const main = async (cb) => {
    try {
        const nft = await RentableNft.at("0x0d460E3C0c21d6D8eD1cD6221793708B171C9853");
        const NFT_CONTRACT = nft.address;
        let txn = await nft.mint("test");
        const TOKEN_ID = txn.logs[0].args.tokenId;
        console.log(txn);
        const marketplace = await Marketplace.at("0x45C57C5dB0bbCEBB6Ea40dFF44896932eBF2fa12");
        const listingFee = (await marketplace.getListingFee()).toString();
        const nftContract = new web3.eth.Contract(ERC721_ABI, NFT_CONTRACT);
        const owner = await nftContract.methods.ownerOf(TOKEN_ID).call();
        txn = await nftContract.methods.approve(marketplace.address, TOKEN_ID).send({from: owner});
        console.log(txn);
        txn = await marketplace.listNFT(
            NFT_CONTRACT, TOKEN_ID, PRICE, START, END, {from: owner, value: listingFee});
        console.log(txn);
        let value = ((EXPIRES - TODAY)/60/60/24 + 1) * PRICE;
        let user = "0x5c764B62A1e693D83d76AdaE5C94530Fabd84D15";
        txn = await marketplace.rentNFT(NFT_CONTRACT, TOKEN_ID, EXPIRES, {from: user, value: value});
        console.log(txn);
        value = (Math.floor((EXPIRES - Date.now()/1000)/60/60/24 + 1)) * PRICE;
        let options = value < 0 ? {from: owner} : {from: owner, value: value};
        txn = await marketplace.unlistNFT(NFT_CONTRACT, TOKEN_ID, options);
        console.log(txn);
    } catch(err) {
        console.log(err);
    }
    cb();
  }
  
module.exports = main;``