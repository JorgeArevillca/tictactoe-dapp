import React from 'react'
import { render } from 'react-dom'

import TruffleContract from 'truffle-contract'
import Web3 from 'web3'

import TicTacToeContractData from '../build/contracts/TicTacToe.json'

import Page from 'components/Page'

import 'assets/scss/style.scss'

const setUpContracts = async () => {
  try {
    const contract = TruffleContract(TicTacToeContractData)
    const { currentProvider } = await web3

    const csp = await contract.setProvider(currentProvider)
    console.log(csp)
    const deployedContract = await contract.deployed()
    console.log(deployedContract)
  } catch (e) {
    throw new Error (e)
  }
}

render(<Page />, document.getElementById("root"), setUpContracts)