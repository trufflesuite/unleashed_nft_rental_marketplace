const Marketplace = artifacts.require("Marketplace");
const TODAY = Math.floor(Date.now()/1000);
const TOMORROW = TODAY + (24*60*60);
const NFT_CONTRACT = "[NFT_CONTRACT]";
const TOKEN_ID = 1;
const EXPIRES = TOMORROW;
const PRICE = 1;

const main = async (cb) => {
    try {
        const marketplace = await Marketplace.deployed();
        let value = ((EXPIRES - TODAY)/60/60/24 + 1) * PRICE;
        let user = (await web3.eth.getAccounts())[0];
        txn = await marketplace.rentNFT(NFT_CONTRACT, TOKEN_ID, EXPIRES, {from: user, value: value});
        console.log(txn);
    } catch(err) {
        console.log(err);
    }
    cb();
  }
  
module.exports = main;