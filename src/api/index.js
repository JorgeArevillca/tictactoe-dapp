import TC from 'truffle-contract'
import Web3 from 'web3'

import { eventWatcher } from './events'

// save instance
let ttt
let tttfactory
// call instance
export const getTTTContractInstance = async () => ttt ? ttt : await setupContract('TicTacToe')
export const getTTTFactoryContractInstance = async () => tttfactory ? tttfactory : await setupContract('TicTacToeFactory')

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

let web3Instance
export const setupWeb3 = async () => {
  if (web3Instance) {
    return web3Instance
  }

  await windowLoaded

  web3Instance = new Web3(getProvider())
  return web3Instance
}

export const getContract = async (name) => {
  const artifact = require(`../../build/contracts/${name}.json`)
  const contract = TruffleContract(artifact)

  try {
    const { currentProvider } = await setupWeb3()
    const csp = await contract.setProvider(currentProvider)
    
    return contract
  } catch (e) {
    throw new Error(e)
  }
}

export const setupContract = async (name) => {
  const contract = await getContract(name)
  try {
    ttt = contract.deployed()
    return ttt

  } catch (e) {
    throw new Error(e)
  }
}

export const getWeb3 = () => web3Instance