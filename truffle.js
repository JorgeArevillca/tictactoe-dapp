const HDWalletProvider = require('truffle-hdwallet-provider')
const mnemonic = "secret"

module.exports = {
  networks: {
    development: {
      host: "localhost",
      port: 8545,
      network_id: "*"
    },
    rinkeby: {
      provider: new HDWalletProvider(mnemonic, 'https://rinkeby.infura.io/'),
      network_id: 42,
    },
  },
};