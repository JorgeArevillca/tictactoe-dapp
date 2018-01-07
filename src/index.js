import React from 'react'
import { render } from 'react-dom'

import TruffleContract from 'truffle-contract'
import Web3 from 'web3'

import Page from 'components/Page'

import 'assets/scss/style.scss'

const setUpContracts = async () => {
  const TTTArtifact = require('../build/contracts/TicTacToe.json')
  const contract = TruffleContract(TTTArtifact)
  try {
    const { currentProvider } = await web3
    const csp = await contract.setProvider(currentProvider)
    
    TTT = await contract.deployed()
  } catch (e) {
    throw new Error (e)
  }
}

render(<Page />, document.getElementById("root"), setUpContracts)