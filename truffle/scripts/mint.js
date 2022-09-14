const RentableNft = artifacts.require("RentableNft");

const main = async (cb) => {
    try {
        const nft = await RentableNft.deployed();
        const txn = await nft.mint("test");
        console.log(txn);
    } catch(err) {
        console.log(err);
    }
    cb();
  }
  
module.exports = main;