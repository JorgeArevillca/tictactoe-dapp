import React, { Component } from 'react'

import TruffleContract from 'truffle-contract'
import Web3 from 'web3'

import TicTacToeContractData from '../../build/contracts/TicTacToe.json'

import Block from 'layouts/Block'

var web3 = new Web3('http://localhost:8545');

class Game extends Component {
  async componentWillMount() {
    const contract = TruffleContract(TicTacToeContractData)
    console.log(contract)
    console.log(TicTacToeContractData)
    const provider = (await web3).currentProvider

    console.log(provider)
    await contract.setProvider(provider)
    const deployedContract = await contract.deployed()
    console.log(deployedContract)
  }

  render() {
    return (
      <Block>
  hi
      </Block>
    )
  }
}

export default Game