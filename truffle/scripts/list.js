const Marketplace = artifacts.require("Marketplace");
const TODAY = Math.floor(Date.now()/1000) + (60*60);
const TOMORROW = TODAY + (24*60*60);
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
    }
];
const NFT_CONTRACT = "[NFT_CONTRACT]";
const TOKEN_ID = 1;
const PRICE = 1;
const START = TODAY;
const END = TOMORROW;

const main = async (cb) => {
    try {
        const marketplace = await Marketplace.deployed();
        const listingFee = (await marketplace.getListingFee()).toString();
        const nftContract = new web3.eth.Contract(ERC721_ABI, NFT_CONTRACT);
        const owner = await nftContract.methods.ownerOf(TOKEN_ID).call();
        let txn = await nftContract.methods.approve(marketplace.address, TOKEN_ID).send({from: owner});
        console.log(txn);
        txn = await marketplace.listNFT(
            NFT_CONTRACT, TOKEN_ID, PRICE, START, END, {from: owner, value: listingFee});
        console.log(txn);
    } catch(err) {
        console.log(err);
    }
    cb();
}

module.exports = main;