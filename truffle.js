const HDWalletProvider = require('truffle-hdwallet-provider')
const secret = require('./secret.json')

module.exports = {
  networks: {
    development: {
      host: "localhost",
      port: 8545,
      network_id: "*"
    },
    kovan: {
      provider: () => new HDWalletProvider(secret.mnemonic, 'https://kovan.infura.io/' + secret.key),
      network_id: 42,
    },
  },
};