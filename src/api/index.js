import TC from 'truffle-contract'
import Web3 from 'web3'
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
  Web3.providers.HttpProvider.prototype.sendAsync = Web3.providers.HttpProvider.prototype.send
  return new Web3.providers.HttpProvider('http://127.0.0.1:8545')
}

let web3Instance
export const setupWeb3 = async () => {
  if (web3Instance) {
    return web3Instance
  }

  await windowLoaded

  web3Instance = new Web3(getProvider())
  window.web3 = web3Instance
  return web3Instance
}

// returns TC wrapped and Provided contract
export const getContract = async (name) => {
  const artifact = require(`../../build/contracts/${name}.json`)
  const contract = TruffleContract(artifact)

  try {
    const { currentProvider } = await setupWeb3()
    console.log(name, currentProvider)
    const csp = await contract.setProvider(currentProvider)
    
    return contract
  } catch (e) {
    throw new Error(e)
  }
}

export const setupContract = async (name) => {
  const contract = await getContract(name)
  try {
    const deplContract = contract.deployed()
    
    return deplContract
  } catch (e) {
    throw new Error(e)
  }
}

export const getWeb3 = () => web3Instance

export const getAccounts = async () => (new Promise(async (resolve, reject) => {
  const web3instance = await setupWeb3()
  web3instance.eth.getAccounts((err, res) => {
    if (err) {
      reject(err)
    } else {
      resolve(res)
    } 
  })
}))

export const waitForEventOnce = (contract, event, args = {}) => new Promise((resolve, reject) => {
  console.log("starting watcher...")
  const watcher = contract[event](args)
  watcher.watch((err, result) => {
    if (err) {
      reject(err)
    } else {
      resolve(result)
    }
    watcher.stopWatching()
  })
})

export const startListener = (contract, event, args) => {
  let callbacks = []
  const watcher = contract[event](args)
  watcher.watch((err, result) => {
    if (err) {
      callbacks.forEach(cb => cb.apply(cb, err, null))
    } else {
      callbacks.forEach(cb => cb.apply(cb, null, result))
    }
  })

  return {
    stop: () => {
      watcher.stopWatching()
    },
    addListener: (cb) => {
      if (callbacks.indexOf(cb) == -1) {
        callbacks.push(cb)
      }
    }
  }
}

export const setDefaultAccount = (account) => {
  
}