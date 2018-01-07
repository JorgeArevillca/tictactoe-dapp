import TC from 'truffle-contract'
import Web3 from 'web3'

const promisedContracts = async (contracts = ['TicTacToe']) => {
  const TCWrappedContracts = contracts.map((cJSON) => TC(require(`../../build/contracts/${cJSON}.json`)))

  try {
    const { currentProvider } = await web3
    const csp = await contract.setProvider(currentProvider)
    
    await contract.deployed()
  } catch (e) {
    throw new Error (e)
  }
}

const TCWrappedContractsArr = (contracts = ['TicTacToe']) => contracts.map((cJSON) => TC(require(`../../build/contracts/${cJSON}.json`)))

// deploys contracts
// @returns [<Promises> of contracts.deployed()]
const deployContracts = async (contracts) => contracts.map(contract => contract.deployed())

const setProvider = async (contracts, provider) => contracts.forEach(c => c.setProvider(provider))

export const init = async () => {
  try {
    const { currentProvider } = await web3

    // const TCContracts = await Promise.all(TCWrappedContractsArr().forEach(c => c.setProvider(currentProvider)))
    // const deployedContracts = await deployContracts(TCContracts)
    // console.log(deployedContracts)
    const tcContracts       = await Promise.all(TCWrappedContractsArr())
    console.log(tcContracts)
    tcContracts.forEach(c => console.log(c))
    // await tcContracts.forEach(c => c.setProvider(currentProvider))
    const deployedContracts = await Promise.all(deployContracts(tcContracts))
    console.log(deployedContracts)
  }
  catch(e) {
    throw new Error (e)
  }
}
