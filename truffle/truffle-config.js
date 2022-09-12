module.exports = {
  // contracts_build_directory: "../client/src/contracts",
  networks: {
    loc_development_development: {
      network_id: "*",
      port: 8545,
      host: "127.0.0.1"
    }
  },
  mocha: {},
  compilers: {
    solc: {
      version: "0.8.14"
    }
  }
};
