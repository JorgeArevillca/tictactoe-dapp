import TC from 'truffle-contract'
import Web3 from 'web3'

// save instance
let ttt
// call instance
export const TTT = () => ttt

export const windowLoaded = new Promise((accept, reject) => {
  if (typeof window === 'undefined') {
    return accept()
  }

  if (typeof window.addEventListener !== 'function') {
    return reject(new Error('expected to be able to register event listener'))
  }

  window.addEventListener('load', function loadHandler(event) {
    window.removeEventListener('load', loadHandler, false)
    return accept(event)
  }, false)
})

const getProvider = () => {
  if (typeof window !== 'undefined' && window.web3) {
    return window.web3.currentProvider
  } else {
    Web3.providers.HttpProvider.prototype.sendAsync = Web3.providers.HttpProvider.prototype.send
    return new Web3.providers.HttpProvider('http://localhost:8545')
  }
}

const setupWeb3 = async () => {
  await windowLoaded

  return new Web3(getProvider())
}

export const setUpContracts = async () => {
  const TTTArtifact = require('../../build/contracts/TicTacToe.json')
  const contract = TruffleContract(TTTArtifact)
  try {
    const { currentProvider } = await setupWeb3()
    console.log(currentProvider)
    const csp = await contract.setProvider(currentProvider)
    
    ttt = await contract.deployed()

  } catch (e) {
    throw new Error (e)
  }
}
